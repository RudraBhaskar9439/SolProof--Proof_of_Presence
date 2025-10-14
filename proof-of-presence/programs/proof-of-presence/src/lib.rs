use anchor_lang::prelude::*;
/*
It gives you access to macros, types, and utilities like:
#[program] — to define your on-chain program module.
#[derive(Accounts)] — for account validation structs.
Context, Result, ErrorCode, Account, Signer, etc.
declare_id!() — to declare your program ID.
*/
use anchor_spl::token::{self, Mint, Token, TokenAccount};
/*
This makes it easier to create tokens
Mint or burn tokens
Transfer tokens between accounts
Work with token accounts (user balances)
*/
use anchor_spl::associated_token::AssociatedToken;
/*
To automatically create a user's associated token account for a given wallet and mint - a standard
convention on Solana
Each wallet + mint pair has exactly one ATA
*/
// use mpl_token_metadata::instruction as mpl_instruction;
/*
Programmable metadata for SPL Tokens
MPL TokenMetadata allows us to add metadata to our tokens
*/

declare_id!("6hktfRKatTFbeCWsZjMHhqjvg7ubXFVae5gPGayyG38B");


#[program]
pub mod proof_of_presence {
    use super::*;

   pub fn create_event(
    ctx: Context<CreateEvent>,
    event_id: String,
    event_name: String,
    event_date: i64,
    max_attendees: u32,
    metadata_uri: String,
   )-> Result<()> {
        let event = &mut ctx.accounts.event;
        event.organizer = ctx.accounts.organizer.key();
        event.event_id = event_id;
        event.event_name = event_name;
        event.event_date = event_date;
        event.max_attendees = max_attendees;
        event.current_attendees = 0;
        event.metadata_uri = metadata_uri;
        event.is_active = true;
        event.bump = ctx.bumps.event;

        msg!("Event Created: {}", event.event_name);
        Ok(())

   }

   pub fn mint_badge(
    ctx: Context<MintBadge>,
    _event_id: String,
    _attendee_metadata_uri: String,
   ) -> Result<()> {
    // Validating the event is active or not 
    require!(ctx.accounts.event.is_active, ErrorCode::EventInactive);

    // Validating if the no of attendees is less than max attendees or not 
    require!(
        ctx.accounts.event.current_attendees < ctx.accounts.event.max_attendees,
        ErrorCode::EventFull
    );

    // Minting NFT using Metaplex
    let event_id_bytes = ctx.accounts.event.event_id.as_bytes();
    let organizer_bytes = ctx.accounts.event.organizer.as_ref();
    let event_bump = ctx.accounts.event.bump;
    
    let cpi_accounts = token::MintTo {
        mint: ctx.accounts.nft_mint.to_account_info(),
        to: ctx.accounts.nft_token_account.to_account_info(),
        authority: ctx.accounts.event.to_account_info(),
    };
    let seeds = &[
        b"event",
        event_id_bytes,
        organizer_bytes,
        &[event_bump],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer,
    );
    token::mint_to(cpi_ctx, 1)?;

    // Update event attendance
    ctx.accounts.event.current_attendees += 1;

    // Update user profile
    ctx.accounts.user_profile.user = ctx.accounts.attendee.key();
    ctx.accounts.user_profile.total_badges += 1;
    ctx.accounts.user_profile.reputation_score += 10; // Base XP
    ctx.accounts.user_profile.attended_events.push(ctx.accounts.event.key());

    msg!("Badge minted for event: {}", ctx.accounts.event.event_name);
    Ok(())

   }

// Update user Reputation
   pub fn update_reputation(
    ctx: Context<UpdateReputation>,
        bonus_xp: u32,
   ) ->Result<()> {
    let user_profile = &mut ctx.accounts.user_profile;
        user_profile.reputation_score += bonus_xp;
        Ok(())
   }

   // Closing the event
   pub fn close_event(ctx: Context<CloseEvent>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    event.is_active = false;
    msg!("Event closed: {}", event.event_name);
    Ok(())
}

}

////////////////////// Accounts //////////////////////

#[derive(Accounts)]
#[instruction(event_id: String)]

pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = organizer,
        space = 8 + Event::INIT_SPACE,
        seeds = [b"event", event_id.as_bytes(), organizer.key().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,
    
    #[account(mut)]
    pub organizer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(event_id: String)]
pub struct MintBadge<'info> {
    #[account(
        mut,
        seeds = [b"event", event_id.as_bytes(), event.organizer.as_ref()],
        bump = event.bump,
    )]
    pub event: Account<'info, Event>,

    #[account(
        init_if_needed,
        payer = attendee,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [b"profile", attendee.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(
        init,
        payer = attendee,
        mint::decimals = 0,
        mint::authority = event,
        mint::freeze_authority = event,
    )]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = attendee,
        associated_token::mint = nft_mint,
        associated_token::authority = attendee,
    )]
    pub nft_token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex metadata account
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub attendee: Signer<'info>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Metaplex token metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        mut,
        seeds = [b"profile", user_profile.user.as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseEvent<'info> {
    #[account(
        mut,
        has_one = organizer,
    )]
    pub event: Account<'info, Event>,
    
    pub organizer: Signer<'info>,
}

// ============ State ============

#[account]
#[derive(InitSpace)]
pub struct Event {
    pub organizer: Pubkey,
    #[max_len(32)]
    pub event_id: String,
    #[max_len(100)]
    pub event_name: String,
    pub event_date: i64,
    pub max_attendees: u32,
    pub current_attendees: u32,
    #[max_len(200)]
    pub metadata_uri: String,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    pub user: Pubkey,
    pub total_badges: u32,
    pub reputation_score: u32,
    #[max_len(50)]
    pub attended_events: Vec<Pubkey>,
}

// ============ Errors ============

#[error_code]
pub enum ErrorCode {
    #[msg("Event is not active")]
    EventInactive,
    #[msg("Event has reached maximum capacity")]
    EventFull,
    #[msg("User has already attended this event")]
    AlreadyAttended,
}

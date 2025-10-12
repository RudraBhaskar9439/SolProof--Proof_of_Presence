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
use mpl_token_metadata::instruction as mpl_instruction;
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
        event.event_id = evnet_id;
        event.event_date = event_date;
        event.max_attendees = max_attendees;
        event.current_attendees = 0;
        event.metadata_uri = metadata_uri;
        evnet.is_active = true;
        event.bump = *ctx.bumps.get("event").unwrap();

        msg!("Event Creted: {}", event.event_name);
        Ok(())

   }

   pub fn mint_badge() -> {}

   pub fn update_reputation() -> {}

}

#[derive(Accounts)]
#[instruction(event_id: String)]

pub struct CreateEvent {}

#[derive(Accounts)]
#[instruction(event_id: String)]
pub struct MintBadge {}

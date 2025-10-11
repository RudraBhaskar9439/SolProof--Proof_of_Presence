use anchor_lang::prelude::*;

declare_id!("6hktfRKatTFbeCWsZjMHhqjvg7ubXFVae5gPGayyG38B");

#[program]
pub mod proof_of_presence {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

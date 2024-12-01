#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("MpF1jqM46dUA1xaMVaxaghCDguKipKxo3prbMmDy7ir");

#[program]
pub mod voting {
    use super::*;

    pub fn init_poll(ctx: Context<InitPoll>, poll_id: u64, poll_question: String) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.poll_question = poll_question;
        poll.candidate_count = 0;
        Ok(())
    }

    pub fn init_candidate(
        ctx: Context<InitCandidate>,
        _poll_id: u64,
        candidate_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_id = candidate_id;
        candidate.candidate_name = candidate_name;
        candidate.votes = 0;

        let poll = &mut ctx.accounts.poll;
        poll.candidate_count += 1;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, _candidate_id: u64) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.votes += 1;
        msg!("Candidate: {}", candidate.candidate_name);
        msg!("Votes: {}", candidate.votes);
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    poll_id: u64,
    #[max_len(280)]
    poll_question: String,
    candidate_count: u64,
}

#[derive(Accounts)]
#[instruction(poll_id:u64)]
pub struct InitPoll<'info> {
    system_program: Program<'info, System>,
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
      init,
      payer = signer,
      space = 8 + Poll::INIT_SPACE,
      seeds = [poll_id.to_le_bytes().as_ref()],
      bump
    )]
    poll: Account<'info, Poll>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    candidate_id: u64,
    #[max_len(32)]
    candidate_name: String,
    votes: u64,
}

#[derive(Accounts)]
#[instruction(poll_id:u64, candidate_id:u64)]
pub struct InitCandidate<'info> {
    system_program: Program<'info, System>,
    #[account(mut)]
    signer: Signer<'info>,
    #[account(
    init,
    payer = signer,
    space = 8 + Candidate::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_id.to_le_bytes().as_ref()],
    bump
  )]
    candidate: Account<'info, Candidate>,
    #[account(
      mut,
      seeds = [poll_id.to_le_bytes().as_ref()],
      bump
    )]
    poll: Account<'info, Poll>,
}

#[derive(Accounts)]
#[instruction(poll_id:u64, candidate_id: u64)]
pub struct Vote<'info> {
    signer: Signer<'info>,
    #[account(
      mut,
      seeds = [poll_id.to_le_bytes().as_ref(), candidate_id.to_le_bytes().as_ref()],
      bump
    )]
    candidate: Account<'info, Candidate>,
}

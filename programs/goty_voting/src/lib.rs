use anchor_lang::prelude::*;

// Beginner note:
// This placeholder lets the starter compile. After running `anchor keys sync`,
// copy the generated program id into this line, Anchor.toml, and the frontend
// constant in app/src/utils/constants.ts.
declare_id!("11111111111111111111111111111111");

const MAX_TITLE_LEN: usize = 80;
const MAX_OPTIONS: usize = 10;
const MAX_OPTION_LEN: usize = 40;

#[program]
pub mod goty_voting {
    use super::*;

    pub fn create_poll(
        ctx: Context<CreatePoll>,
        poll_id: u64,
        title: String,
        options: Vec<String>,
    ) -> Result<()> {
        require!(!title.trim().is_empty(), GotyError::EmptyTitle);
        require!(title.len() <= MAX_TITLE_LEN, GotyError::TitleTooLong);
        require!(options.len() >= 2, GotyError::TooFewOptions);
        require!(options.len() <= MAX_OPTIONS, GotyError::TooManyOptions);

        for option in &options {
            require!(!option.trim().is_empty(), GotyError::InvalidOption);
            require!(option.len() <= MAX_OPTION_LEN, GotyError::OptionTooLong);
        }

        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.creator = ctx.accounts.creator.key();
        poll.title = title;
        poll.vote_counts = vec![0; options.len()];
        poll.options = options;
        poll.total_votes = 0;
        poll.created_at = Clock::get()?.unix_timestamp;
        poll.bump = ctx.bumps.poll;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let index = option_index as usize;
        require!(index < poll.options.len(), GotyError::InvalidOption);

        let current_option_votes = poll.vote_counts[index];
        poll.vote_counts[index] = current_option_votes
            .checked_add(1)
            .ok_or(GotyError::MathOverflow)?;
        poll.total_votes = poll
            .total_votes
            .checked_add(1)
            .ok_or(GotyError::MathOverflow)?;

        let vote = &mut ctx.accounts.vote;
        vote.voter = ctx.accounts.voter.key();
        vote.poll = poll.key();
        vote.poll_id = poll.poll_id;
        vote.option_index = option_index;
        vote.voted_at = Clock::get()?.unix_timestamp;
        vote.bump = ctx.bumps.vote;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct CreatePoll<'info> {
    #[account(
        init,
        payer = creator,
        space = Poll::SPACE,
        seeds = [b"poll", creator.key().as_ref(), &poll_id.to_le_bytes()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = voter,
        space = VoteRecord::SPACE,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Poll {
    pub poll_id: u64,
    pub creator: Pubkey,
    pub title: String,
    pub options: Vec<String>,
    pub vote_counts: Vec<u64>,
    pub total_votes: u64,
    pub created_at: i64,
    pub bump: u8,
}

impl Poll {
    pub const SPACE: usize = 8 // discriminator
        + 8 // poll_id
        + 32 // creator
        + 4 + MAX_TITLE_LEN // title
        + 4 + (MAX_OPTIONS * (4 + MAX_OPTION_LEN)) // options
        + 4 + (MAX_OPTIONS * 8) // vote_counts
        + 8 // total_votes
        + 8 // created_at
        + 1; // bump
}

#[account]
pub struct VoteRecord {
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub poll_id: u64,
    pub option_index: u8,
    pub voted_at: i64,
    pub bump: u8,
}

impl VoteRecord {
    pub const SPACE: usize = 8 // discriminator
        + 32 // voter
        + 32 // poll
        + 8 // poll_id
        + 1 // option_index
        + 8 // voted_at
        + 1; // bump
}

#[error_code]
pub enum GotyError {
    #[msg("Poll title cannot be empty.")]
    EmptyTitle,
    #[msg("Poll title is too long.")]
    TitleTooLong,
    #[msg("A poll needs at least two game options.")]
    TooFewOptions,
    #[msg("A poll can have at most ten game options.")]
    TooManyOptions,
    #[msg("Game option names cannot be empty.")]
    InvalidOption,
    #[msg("Game option name is too long.")]
    OptionTooLong,
    #[msg("Vote count overflowed.")]
    MathOverflow,
}

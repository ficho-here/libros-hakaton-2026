use anchor_lang::prelude::*;

// Beginner note:
// This placeholder lets the starter compile. After running `anchor keys sync`,
// copy the generated program id into this line, Anchor.toml, and the frontend
// constant in app/src/utils/constants.ts.
declare_id!("11111111111111111111111111111111");

const MAX_TITLE_LEN: usize = 80;
const MIN_OPTIONS: usize = 2;
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
        require!(!title.trim().is_empty(), VotingError::TitleEmpty);
        require!(title.len() <= MAX_TITLE_LEN, VotingError::TitleTooLong);
        require!(
            options.len() >= MIN_OPTIONS,
            VotingError::NotEnoughOptions
        );
        require!(options.len() <= MAX_OPTIONS, VotingError::TooManyOptions);

        for option in &options {
            require!(!option.trim().is_empty(), VotingError::OptionEmpty);
            require!(option.len() <= MAX_OPTION_LEN, VotingError::OptionTooLong);
        }

        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.creator = ctx.accounts.creator.key();
        poll.title = title;
        poll.votes = vec![0; options.len()];
        poll.options = options;
        poll.created_at = Clock::get()?.unix_timestamp;
        poll.bump = ctx.bumps.poll;

        Ok(())
    }

    pub fn vote(ctx: Context<VoteOnPoll>, option_index: u8) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let option_index_usize = option_index as usize;

        require!(
            option_index_usize < poll.options.len(),
            VotingError::InvalidOption
        );

        poll.votes[option_index_usize] = poll.votes[option_index_usize]
            .checked_add(1)
            .ok_or(VotingError::VoteOverflow)?;

        let vote = &mut ctx.accounts.vote;
        vote.voter = ctx.accounts.voter.key();
        vote.poll = poll.key();
        vote.option_index = option_index;
        vote.timestamp = Clock::get()?.unix_timestamp;
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
        seeds = [b"poll", poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnPoll<'info> {
    #[account(mut)]
    pub poll: Account<'info, Poll>,

    // Duplicate-vote prevention lives in this PDA:
    // the same poll and voter always derive the same Vote account address.
    // Because this instruction uses `init`, a second vote fails automatically
    // when Anchor sees that the Vote account already exists.
    #[account(
        init,
        payer = voter,
        space = Vote::SPACE,
        seeds = [b"vote", poll.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Poll {
    // Poll stores the voting question, the choices, and one counter per choice.
    pub poll_id: u64,
    pub creator: Pubkey,
    pub title: String,
    pub options: Vec<String>,
    pub votes: Vec<u64>,
    pub created_at: i64,
    pub bump: u8,
}

impl Poll {
    pub const SPACE: usize = 8 // discriminator
        + 8 // poll_id
        + 32 // creator
        + 4 + MAX_TITLE_LEN // title
        + 4 + (MAX_OPTIONS * (4 + MAX_OPTION_LEN)) // options
        + 4 + (MAX_OPTIONS * 8) // votes
        + 8 // created_at
        + 1; // bump
}

#[account]
pub struct Vote {
    // Vote stores one wallet's selection for one poll.
    pub voter: Pubkey,
    pub poll: Pubkey,
    pub option_index: u8,
    pub timestamp: i64,
    pub bump: u8,
}

impl Vote {
    pub const SPACE: usize = 8 // discriminator
        + 32 // voter
        + 32 // poll
        + 1 // option_index
        + 8 // timestamp
        + 1; // bump
}

#[error_code]
pub enum VotingError {
    #[msg("Poll title cannot be empty.")]
    TitleEmpty,
    #[msg("Poll title is too long.")]
    TitleTooLong,
    #[msg("A poll needs at least two options.")]
    NotEnoughOptions,
    #[msg("A poll can have at most ten options.")]
    TooManyOptions,
    #[msg("Poll options cannot be empty.")]
    OptionEmpty,
    #[msg("Poll option is too long.")]
    OptionTooLong,
    #[msg("Selected option does not exist.")]
    InvalidOption,
    #[msg("Vote count overflowed.")]
    VoteOverflow,
}

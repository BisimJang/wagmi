use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
        CreateMetadataAccountsV3, Metadata, mpl_token_metadata::types::DataV2,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

// Replace this with your actual deployed program ID
declare_id!("Fhqu55654fdmFzAs5fU5TjMBEFLL1NvjFcA7ptheWrDN");

#[program]
pub mod wagmi_solana {
    use super::*;

    pub fn initialize_school(ctx: Context<InitializeSchool>, name: String) -> Result<()> {
        let school = &mut ctx.accounts.school;
        school.owner = ctx.accounts.owner.key();
        school.name = name;
        school.total_courses = 0;
        school.total_students = 0;
        school.bump = ctx.bumps.school;
        Ok(())
    }

    pub fn create_course(
        ctx: Context<CreateCourse>,
        course_id: u64,
        price: u64,
        is_public: bool,
    ) -> Result<()> {
        let school = &mut ctx.accounts.school;
        let course = &mut ctx.accounts.course;

        // Ensure the owner of the school is the one creating the course
        require!(school.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        course.school = school.key();
        course.course_id = course_id;
        course.price = price;
        course.is_public = is_public;
        course.bump = ctx.bumps.course;

        school.total_courses = school.total_courses.checked_add(1).unwrap();

        Ok(())
    }

    pub fn enroll_student(ctx: Context<EnrollStudent>, course_id: u64) -> Result<()> {
        let course = &ctx.accounts.course;
        let school = &mut ctx.accounts.school;
        let student_account = &mut ctx.accounts.student_account;
        
        // Handle payment if price > 0
        if course.price > 0 {
            // Check if student has enough funds
            require!(ctx.accounts.student.lamports() >= course.price, ErrorCode::InsufficientFunds);
            
            // Transfer lamports from student to school owner
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.student.key(),
                &ctx.accounts.school_owner.key(),
                course.price,
            );
            
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.student.to_account_info(),
                    ctx.accounts.school_owner.to_account_info(),
                ],
            )?;
        }

        student_account.student = ctx.accounts.student.key();
        student_account.course = course.key();
        student_account.course_id = course_id;
        student_account.is_completed = false;
        student_account.bump = ctx.bumps.student_account;

        school.total_students = school.total_students.checked_add(1).unwrap();

        Ok(())
    }

    pub fn complete_course(
        ctx: Context<CompleteCourse>, 
        _course_id: u64,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
    ) -> Result<()> {
        let student_account = &mut ctx.accounts.student_account;
        let school = &ctx.accounts.school;

        // Only school owner can mark a course as completed for now
        require!(school.owner == ctx.accounts.owner.key(), ErrorCode::Unauthorized);

        student_account.is_completed = true;

        // --- MINT NFT CERTIFICATE ---
        
        let school_key = school.owner.key();
        let seeds = &[
            b"school",
            school_key.as_ref(),
            &[school.bump],
        ];
        let signer = &[&seeds[..]];

        // 1. Mint 1 Token to Student's ATA
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.student_token_account.to_account_info(),
            authority: school.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        mint_to(cpi_ctx, 1)?;

        // 2. Create Metadata Account
        let data_v2 = DataV2 {
            name: metadata_title,
            symbol: metadata_symbol,
            uri: metadata_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        let create_metadata_accounts = CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: school.to_account_info(),
            payer: ctx.accounts.owner.to_account_info(),
            update_authority: school.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_ctx_metadata = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            create_metadata_accounts,
            signer,
        );
        create_metadata_accounts_v3(cpi_ctx_metadata, data_v2, true, true, None)?;

        // 3. Create Master Edition Account (Locks supply at 1)
        let create_master_edition = CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            update_authority: school.to_account_info(),
            mint_authority: school.to_account_info(),
            payer: ctx.accounts.owner.to_account_info(),
            metadata: ctx.accounts.metadata_account.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        let cpi_ctx_master_edition = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            create_master_edition,
            signer,
        );
        create_master_edition_v3(cpi_ctx_master_edition, Some(0))?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeSchool<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 4 + 50 + 8 + 8 + 1, // Discriminator + Owner + String prefix + Name max 50 + count + count + bump
        seeds = [b"school", owner.key().as_ref()],
        bump
    )]
    pub school: Account<'info, School>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(course_id: u64)]
pub struct CreateCourse<'info> {
    #[account(mut)]
    pub school: Account<'info, School>,
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 1 + 1, // Discriminator + School + course_id + price + public + bump
        seeds = [b"course", school.key().as_ref(), course_id.to_le_bytes().as_ref()],
        bump
    )]
    pub course: Account<'info, Course>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(course_id: u64)]
pub struct EnrollStudent<'info> {
    #[account(mut)]
    pub school: Account<'info, School>,
    #[account(
        seeds = [b"course", school.key().as_ref(), course_id.to_le_bytes().as_ref()],
        bump = course.bump
    )]
    pub course: Account<'info, Course>,
    #[account(
        init,
        payer = student,
        space = 8 + 32 + 32 + 8 + 1 + 1, // Discriminator + Student + Course + Course_id + completed + bump
        seeds = [b"enrollment", course.key().as_ref(), student.key().as_ref()],
        bump
    )]
    pub student_account: Account<'info, StudentAccount>,
    #[account(mut)]
    pub student: Signer<'info>,
    /// CHECK: We just need to transfer lamports to the school owner
    #[account(mut, address = school.owner)]
    pub school_owner: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(course_id: u64)]
pub struct CompleteCourse<'info> {
    pub school: Account<'info, School>,
    #[account(
        seeds = [b"course", school.key().as_ref(), course_id.to_le_bytes().as_ref()],
        bump = course.bump
    )]
    pub course: Account<'info, Course>,
    #[account(
        mut,
        seeds = [b"enrollment", course.key().as_ref(), student_account.student.as_ref()],
        bump = student_account.bump
    )]
    pub student_account: Account<'info, StudentAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: The actual wallet of the student who is receiving the NFT certificate
    #[account(mut, address = student_account.student)]
    pub student_wallet: AccountInfo<'info>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = school,
        mint::freeze_authority = school,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = student_wallet,
    )]
    pub student_token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex Metadata PDA
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: Metaplex Master Edition PDA
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct School {
    pub owner: Pubkey,
    pub name: String,
    pub total_courses: u64,
    pub total_students: u64,
    pub bump: u8,
}

#[account]
pub struct Course {
    pub school: Pubkey,
    pub course_id: u64,
    pub price: u64,
    pub is_public: bool,
    pub bump: u8,
}

#[account]
pub struct StudentAccount {
    pub student: Pubkey,
    pub course: Pubkey,
    pub course_id: u64,
    pub is_completed: bool,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Insufficient funds for the course price.")]
    InsufficientFunds,
}

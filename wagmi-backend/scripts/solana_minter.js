const anchor = require("@coral-xyz/anchor");
const { PublicKey, Keypair, Connection, SystemProgram, SYSVAR_RENT_PUBKEY } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

// Load Environment Variables (Assuming this is called from the backend root)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Extract arguments from command line
const args = process.argv.slice(2);
if (args.length < 5) {
    console.error("Usage: node solana_minter.js <studentWallet> <courseId> <metadataTitle> <metadataSymbol> <metadataUri>");
    process.exit(1);
}

const [studentWalletStr, courseIdStr, metadataTitle, metadataSymbol, metadataUri] = args;
const courseId = new anchor.BN(courseIdStr);

// Load the Master Backend Wallet
const privateKeyString = process.env.OWNER_PRIVATE_KEY;
if (!privateKeyString) {
    console.error("OWNER_PRIVATE_KEY not found in .env");
    process.exit(1);
}

// Convert from array string or base58 to Keypair (Assuming comma separated byte array for simplicity, typical of Solana)
let secretKey;
try {
    secretKey = Uint8Array.from(JSON.parse(privateKeyString));
} catch (e) {
    // If it's a hex string from Ethereum days, this needs to be an actual Solana private key array
    console.error("Invalid Solana Private Key format. Must be a JSON array of bytes.");
    process.exit(1);
}
const backendWallet = Keypair.fromSecretKey(secretKey);

// Connect to Devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(backendWallet);
const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
anchor.setProvider(provider);

// Load Program
const idlPath = path.resolve(__dirname, "solana_idl.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
const programId = new PublicKey("QNQzJHCcHhSF58QLixxTA5avSwLWHX1bKVBMAXCFwT6");
const program = new anchor.Program(idl, programId, provider);

// Metaplex Constants
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

async function mintCertificate() {
    try {
        const studentWallet = new PublicKey(studentWalletStr);
        
        // 1. Derive PDAs
        const [schoolPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("school"), backendWallet.publicKey.toBuffer()],
            programId
        );

        const courseIdBuffer = Buffer.alloc(8);
        courseIdBuffer.writeBigUInt64LE(BigInt(courseId.toString()));
        const [coursePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("course"), schoolPda.toBuffer(), courseIdBuffer],
            programId
        );

        const [studentAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("enrollment"), coursePda.toBuffer(), studentWallet.toBuffer()],
            programId
        );

        // 2. Generate new Mint Account for the NFT
        const mintKeypair = Keypair.generate();

        // 3. Derive Associated Token Account for student
        const [studentTokenAccount] = PublicKey.findProgramAddressSync(
            [studentWallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // 4. Derive Metaplex PDAs
        const [metadataAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
            METADATA_PROGRAM_ID
        );

        const [masterEditionAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer(), Buffer.from("edition")],
            METADATA_PROGRAM_ID
        );

        // 5. Execute Transaction
        const tx = await program.methods.completeCourse(
            courseId,
            metadataTitle,
            metadataSymbol,
            metadataUri
        ).accounts({
            school: schoolPda,
            course: coursePda,
            studentAccount: studentAccountPda,
            owner: backendWallet.publicKey,
            studentWallet: studentWallet,
            mint: mintKeypair.publicKey,
            studentTokenAccount: studentTokenAccount,
            metadataAccount: metadataAccount,
            masterEditionAccount: masterEditionAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        }).signers([backendWallet, mintKeypair]).rpc();

        console.log(JSON.stringify({ success: true, tx_hash: tx, mint: mintKeypair.publicKey.toString() }));
    } catch (err) {
        console.error(JSON.stringify({ success: false, error: err.message }));
        process.exit(1);
    }
}

mintCertificate();

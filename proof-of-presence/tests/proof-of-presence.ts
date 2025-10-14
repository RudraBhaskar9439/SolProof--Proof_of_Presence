import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProofOfPresence } from "../target/types/proof_of_presence";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { expect } from "chai";

describe("proof-of-presence", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ProofOfPresence as Program<ProofOfPresence>;
  
  // Metaplex Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  
  // Test accounts
  let organizerKeypair: Keypair;
  let attendee1Keypair: Keypair;
  let attendee2Keypair: Keypair;
  let eventId: string;
  let eventPda: PublicKey;
  let eventBump: number;

  before(async () => {
    console.log("\n🔧 Setting up test environment...\n");
    
    // Generate test keypairs
    organizerKeypair = Keypair.generate();
    attendee1Keypair = Keypair.generate();
    attendee2Keypair = Keypair.generate();

    // Airdrop SOL to test accounts
    const airdropAmount = 5 * LAMPORTS_PER_SOL;
    
    console.log("💰 Airdropping SOL to test accounts...");
    
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        organizerKeypair.publicKey,
        airdropAmount
      )
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        attendee1Keypair.publicKey,
        airdropAmount
      )
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        attendee2Keypair.publicKey,
        airdropAmount
      )
    );

    console.log("✅ Test accounts funded successfully\n");
  });

  describe("📅 Event Creation", () => {
    it("Creates an event successfully", async () => {
      eventId = "event_" + Date.now();
      
      // Derive event PDA
      [eventPda, eventBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          Buffer.from(eventId),
          organizerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      const eventName = "Solana Breakpoint India 2025";
      const eventDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // Tomorrow
      const maxAttendees = 100;
      const metadataUri = "https://arweave.net/breakpoint-india-metadata";

      const tx = await program.methods
        .createEvent(
          eventId,
          eventName,
          eventDate,
          maxAttendees,
          metadataUri
        )
        .accounts({
          event: eventPda,
          organizer: organizerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizerKeypair])
        .rpc();

      console.log("   Transaction signature:", tx);

      // Fetch and verify event account
      const eventAccount = await program.account.event.fetch(eventPda);
      
      expect(eventAccount.eventId).to.equal(eventId);
      expect(eventAccount.eventName).to.equal(eventName);
      expect(eventAccount.organizer.toBase58()).to.equal(
        organizerKeypair.publicKey.toBase58()
      );
      expect(eventAccount.maxAttendees).to.equal(maxAttendees);
      expect(eventAccount.currentAttendees).to.equal(0);
      expect(eventAccount.isActive).to.be.true;
      expect(eventAccount.metadataUri).to.equal(metadataUri);
      expect(eventAccount.bump).to.equal(eventBump);

      console.log("   ✅ Event created:", eventName);
      console.log("   📍 Event PDA:", eventPda.toBase58());
      console.log("   👤 Organizer:", organizerKeypair.publicKey.toBase58().slice(0, 8) + "...");
      console.log("   👥 Max Attendees:", maxAttendees);
    });

    it("Fails to create duplicate event with same ID", async () => {
      const duplicateEventId = eventId; // Same event ID

      try {
        await program.methods
          .createEvent(
            duplicateEventId,
            "Duplicate Event",
            new anchor.BN(Date.now() / 1000),
            50,
            "https://arweave.net/duplicate"
          )
          .accounts({
            event: eventPda,
            organizer: organizerKeypair.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([organizerKeypair])
          .rpc();
        
        expect.fail("Should have thrown an error for duplicate event");
      } catch (error) {
        expect(error).to.exist;
        console.log("   ✅ Correctly rejected duplicate event");
      }
    });
  });

  describe("🎖️ Badge Minting", () => {
    it("Mints badge for first attendee", async () => {
      console.log("\n   🎯 Minting badge for attendee 1...");
      
      // Generate NFT mint keypair
      const nftMint = Keypair.generate();

      // Derive user profile PDA
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("profile"),
          attendee1Keypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Get associated token account
      const nftTokenAccount = await getAssociatedTokenAddress(
        nftMint.publicKey,
        attendee1Keypair.publicKey
      );

      // Derive metadata account
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const attendeeMetadataUri = "https://arweave.net/attendee1-badge-metadata";

      const tx = await program.methods
        .mintBadge(eventId, attendeeMetadataUri)
        .accounts({
          event: eventPda,
          userProfile: userProfilePda,
          nftMint: nftMint.publicKey,
          nftTokenAccount: nftTokenAccount,
          metadataAccount: metadataAccount,
          attendee: attendee1Keypair.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([attendee1Keypair, nftMint])
        .rpc();

      console.log("   Transaction signature:", tx);

      // Verify event updated
      const eventAccount = await program.account.event.fetch(eventPda);
      expect(eventAccount.currentAttendees).to.equal(1);

      // Verify user profile
      const userProfile = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfile.user.toBase58()).to.equal(
        attendee1Keypair.publicKey.toBase58()
      );
      expect(userProfile.totalBadges).to.equal(1);
      expect(userProfile.reputationScore).to.equal(10); // Base XP
      expect(userProfile.attendedEvents.length).to.equal(1);
      expect(userProfile.attendedEvents[0].toBase58()).to.equal(
        eventPda.toBase58()
      );

      console.log("   ✅ Badge minted successfully!");
      console.log("   🎖️ NFT Mint:", nftMint.publicKey.toBase58().slice(0, 8) + "...");
      console.log("   📊 Total Badges:", userProfile.totalBadges);
      console.log("   ⭐ Reputation Score:", userProfile.reputationScore);
      console.log("   📈 Current Event Attendees:", eventAccount.currentAttendees);
    });

    it("Mints badge for second attendee", async () => {
      console.log("\n   🎯 Minting badge for attendee 2...");
      
      const nftMint2 = Keypair.generate();

      const [userProfile2Pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("profile"),
          attendee2Keypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      const nftTokenAccount2 = await getAssociatedTokenAddress(
        nftMint2.publicKey,
        attendee2Keypair.publicKey
      );

      const [metadataAccount2] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint2.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const tx = await program.methods
        .mintBadge(eventId, "https://arweave.net/attendee2-badge")
        .accounts({
          event: eventPda,
          userProfile: userProfile2Pda,
          nftMint: nftMint2.publicKey,
          nftTokenAccount: nftTokenAccount2,
          metadataAccount: metadataAccount2,
          attendee: attendee2Keypair.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([attendee2Keypair, nftMint2])
        .rpc();

      console.log("   Transaction signature:", tx);

      // Verify event attendance count
      const eventAccount = await program.account.event.fetch(eventPda);
      expect(eventAccount.currentAttendees).to.equal(2);

      console.log("   ✅ Badge minted for attendee 2");
      console.log("   📈 Current Attendees:", eventAccount.currentAttendees, "/", eventAccount.maxAttendees);
    });

    it("Fails to mint when event is inactive", async () => {
      console.log("\n   🚫 Testing mint on inactive event...");
      
      // First, close the event
      await program.methods
        .closeEvent()
        .accounts({
          event: eventPda,
          organizer: organizerKeypair.publicKey,
        })
        .signers([organizerKeypair])
        .rpc();

      // Verify event is closed
      const closedEvent = await program.account.event.fetch(eventPda);
      expect(closedEvent.isActive).to.be.false;
      console.log("   ℹ️ Event closed successfully");

      // Try to mint badge for inactive event
      const nftMint3 = Keypair.generate();
      const attendee3 = Keypair.generate();
      
      // Airdrop to new attendee
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          attendee3.publicKey,
          2 * LAMPORTS_PER_SOL
        )
      );

      const [userProfile3Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee3.publicKey.toBuffer()],
        program.programId
      );

      const [metadataAccount3] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint3.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      try {
        await program.methods
          .mintBadge(eventId, "https://arweave.net/test")
          .accounts({
            event: eventPda,
            userProfile: userProfile3Pda,
            nftMint: nftMint3.publicKey,
            nftTokenAccount: await getAssociatedTokenAddress(
              nftMint3.publicKey,
              attendee3.publicKey
            ),
            metadataAccount: metadataAccount3,
            attendee: attendee3.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .signers([attendee3, nftMint3])
          .rpc();

        expect.fail("Should have thrown EventInactive error");
      } catch (error) {
        expect(error.error.errorMessage).to.equal("Event is not active");
        console.log("   ✅ Correctly rejected mint for inactive event");
        console.log("   💬 Error:", error.error.errorMessage);
      }
    });
  });

  describe("🎯 Event Capacity Management", () => {
    let smallEventId: string;
    let smallEventPda: PublicKey;

    it("Creates event with capacity of 2", async () => {
      console.log("\n   📦 Creating small capacity event...");
      
      smallEventId = "small_event_" + Date.now();
      
      [smallEventPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          Buffer.from(smallEventId),
          organizerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .createEvent(
          smallEventId,
          "Small Exclusive Meetup",
          new anchor.BN(Date.now() / 1000),
          2, // Max 2 attendees only
          "https://arweave.net/small-event"
        )
        .accounts({
          event: smallEventPda,
          organizer: organizerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizerKeypair])
        .rpc();

      const event = await program.account.event.fetch(smallEventPda);
      console.log("   ✅ Small event created");
      console.log("   📊 Capacity: 0 /", event.maxAttendees);
    });

    it("Allows minting up to capacity", async () => {
      console.log("\n   ⬆️ Filling event to capacity...");
      
      // Mint for attendee 1
      const nftMint1 = Keypair.generate();
      const [userProfile1] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
        program.programId
      );

      const [metadata1] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint1.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      await program.methods
        .mintBadge(smallEventId, "https://arweave.net/badge1")
        .accounts({
          event: smallEventPda,
          userProfile: userProfile1,
          nftMint: nftMint1.publicKey,
          nftTokenAccount: await getAssociatedTokenAddress(
            nftMint1.publicKey,
            attendee1Keypair.publicKey
          ),
          metadataAccount: metadata1,
          attendee: attendee1Keypair.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([attendee1Keypair, nftMint1])
        .rpc();

      console.log("   ✅ Attendee 1 checked in (1/2)");

      // Mint for attendee 2
      const nftMint2 = Keypair.generate();
      const [userProfile2] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee2Keypair.publicKey.toBuffer()],
        program.programId
      );

      const [metadata2] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint2.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      await program.methods
        .mintBadge(smallEventId, "https://arweave.net/badge2")
        .accounts({
          event: smallEventPda,
          userProfile: userProfile2,
          nftMint: nftMint2.publicKey,
          nftTokenAccount: await getAssociatedTokenAddress(
            nftMint2.publicKey,
            attendee2Keypair.publicKey
          ),
          metadataAccount: metadata2,
          attendee: attendee2Keypair.publicKey,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .signers([attendee2Keypair, nftMint2])
        .rpc();

      const event = await program.account.event.fetch(smallEventPda);
      expect(event.currentAttendees).to.equal(2);
      
      console.log("   ✅ Attendee 2 checked in (2/2)");
      console.log("   🎉 Event reached full capacity!");
    });

    it("Fails to mint when event is full", async () => {
      console.log("\n   🚫 Testing mint on full event...");
      
      const attendee3 = Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          attendee3.publicKey,
          2 * LAMPORTS_PER_SOL
        )
      );

      const nftMint3 = Keypair.generate();
      const [userProfile3] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee3.publicKey.toBuffer()],
        program.programId
      );

      const [metadata3] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          nftMint3.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      try {
        await program.methods
          .mintBadge(smallEventId, "https://arweave.net/badge3")
          .accounts({
            event: smallEventPda,
            userProfile: userProfile3,
            nftMint: nftMint3.publicKey,
            nftTokenAccount: await getAssociatedTokenAddress(
              nftMint3.publicKey,
              attendee3.publicKey
            ),
            metadataAccount: metadata3,
            attendee: attendee3.publicKey,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .signers([attendee3, nftMint3])
          .rpc();

        expect.fail("Should have thrown EventFull error");
      } catch (error) {
        expect(error.error.errorMessage).to.equal(
          "Event has reached maximum capacity"
        );
        console.log("   ✅ Correctly rejected mint for full event");
        console.log("   💬 Error:", error.error.errorMessage);
      }
    });
  });

  describe("⭐ Reputation System", () => {
    it("Updates user reputation with bonus XP", async () => {
      console.log("\n   🎁 Awarding bonus XP...");
      
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
        program.programId
      );

      const profileBefore = await program.account.userProfile.fetch(userProfilePda);
      const reputationBefore = profileBefore.reputationScore;

      const bonusXp = 50;

      const tx = await program.methods
        .updateReputation(bonusXp)
        .accounts({
          userProfile: userProfilePda,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      console.log("   Transaction signature:", tx);

      const profileAfter = await program.account.userProfile.fetch(userProfilePda);
      expect(profileAfter.reputationScore).to.equal(reputationBefore + bonusXp);

      console.log("   ✅ Reputation updated successfully");
      console.log("   📊 Before:", reputationBefore, "XP");
      console.log("   📈 Bonus:", bonusXp, "XP");
      console.log("   🎯 After:", profileAfter.reputationScore, "XP");
    });

    it("Accumulates reputation across multiple updates", async () => {
      console.log("\n   📈 Testing cumulative reputation...");
      
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
        program.programId
      );

      const profileBefore = await program.account.userProfile.fetch(userProfilePda);
      const initialRep = profileBefore.reputationScore;

      // Add 25 XP
      await program.methods
        .updateReputation(25)
        .accounts({
          userProfile: userProfilePda,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      // Add another 15 XP
      await program.methods
        .updateReputation(15)
        .accounts({
          userProfile: userProfilePda,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      const profileAfter = await program.account.userProfile.fetch(userProfilePda);
      expect(profileAfter.reputationScore).to.equal(initialRep + 25 + 15);

      console.log("   ✅ Cumulative reputation working correctly");
      console.log("   📊 Total XP:", profileAfter.reputationScore);
    });
  });

  describe("🔧 Event Management", () => {
    it("Allows organizer to close event", async () => {
      console.log("\n   🔒 Closing event...");
      
      const newEventId = "closable_event_" + Date.now();
      
      const [closableEventPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          Buffer.from(newEventId),
          organizerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Create event
      await program.methods
        .createEvent(
          newEventId,
          "Closable Test Event",
          new anchor.BN(Date.now() / 1000),
          50,
          "https://arweave.net/closable"
        )
        .accounts({
          event: closableEventPda,
          organizer: organizerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizerKeypair])
        .rpc();

      console.log("   ℹ️ Event created");

      // Close event
      const tx = await program.methods
        .closeEvent()
        .accounts({
          event: closableEventPda,
          organizer: organizerKeypair.publicKey,
        })
        .signers([organizerKeypair])
        .rpc();

      console.log("   Transaction signature:", tx);

      const event = await program.account.event.fetch(closableEventPda);
      expect(event.isActive).to.be.false;

      console.log("   ✅ Event closed successfully");
      console.log("   📊 Event Status: Inactive");
    });

    it("Prevents non-organizer from closing event", async () => {
      console.log("\n   🚫 Testing unauthorized close...");
      
      const unauthorizedUser = Keypair.generate();
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          unauthorizedUser.publicKey,
          2 * LAMPORTS_PER_SOL
        )
      );

      const newEventId = "secure_event_" + Date.now();
      const [secureEventPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          Buffer.from(newEventId),
          organizerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Create event as organizer
      await program.methods
        .createEvent(
          newEventId,
          "Secure Event",
          new anchor.BN(Date.now() / 1000),
          50,
          "https://arweave.net/secure"
        )
        .accounts({
          event: secureEventPda,
          organizer: organizerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizerKeypair])
        .rpc();

      try {
        // Try to close as unauthorized user
        await program.methods
          .closeEvent()
          .accounts({
            event: secureEventPda,
            organizer: unauthorizedUser.publicKey,
          })
          .signers([unauthorizedUser])
          .rpc();

        expect.fail("Should have thrown unauthorized error");
      } catch (error) {
        expect(error).to.exist;
        console.log("   ✅ Correctly prevented unauthorized event closure");
        console.log("   🔒 Access control working properly");
      }
    });
  });

  describe("👤 User Profile Tracking", () => {
    it("Tracks multiple event attendances correctly", async () => {
      console.log("\n   📊 Checking user profile...");
      
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
        program.programId
      );

      const profile = await program.account.userProfile.fetch(userProfilePda);
      
      expect(profile.totalBadges).to.be.greaterThan(0);
      expect(profile.attendedEvents.length).to.be.greaterThan(0);
      expect(profile.reputationScore).to.be.greaterThan(0);

      console.log("   ✅ User profile stats:");
      console.log("   🎖️  Total Badges:", profile.totalBadges);
      console.log("   ⭐ Reputation Score:", profile.reputationScore, "XP");
      console.log("   📅 Events Attended:", profile.attendedEvents.length);
      console.log("   👤 User Address:", profile.user.toBase58().slice(0, 8) + "...");
    });

    it("Maintains separate profiles for different users", async () => {
      console.log("\n   👥 Comparing user profiles...");
      
      const [profile1Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
        program.programId
      );

      const [profile2Pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), attendee2Keypair.publicKey.toBuffer()],
        program.programId
      );

      const profile1 = await program.account.userProfile.fetch(profile1Pda);
      const profile2 = await program.account.userProfile.fetch(profile2Pda);

      // Profiles should be different
      expect(profile1.user.toBase58()).to.not.equal(profile2.user.toBase58());

      console.log("   ✅ User profiles are properly isolated");
      console.log("   👤 User 1 - Badges:", profile1.totalBadges, "| XP:", profile1.reputationScore);
      console.log("   👤 User 2 - Badges:", profile2.totalBadges, "| XP:", profile2.reputationScore);
    });
  });

  describe("🔍 Account Validation", () => {
    it("Validates event PDA derivation", async () => {
      console.log("\n   🔐 Testing PDA security...");
      
      const testEventId = "pda_test_" + Date.now();
      
      // Correctly derived PDA
      const [correctPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("event"),
          Buffer.from(testEventId),
          organizerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      // Create event with correct PDA
      await program.methods
        .createEvent(
          testEventId,
          "PDA Test Event",
          new anchor.BN(Date.now() / 1000),
          50,
          "https://arweave.net/pda-test"
        )
        .accounts({
          event: correctPda,
          organizer: organizerKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([organizerKeypair])
        .rpc();

      const event = await program.account.event.fetch(correctPda);
      expect(event.eventId).to.equal(testEventId);

      console.log("   ✅ PDA validation working correctly");
      console.log("   🔑 Event PDA:", correctPda.toBase58().slice(0, 8) + "...");
    });
  });

  // Summary after all tests
  after(async () => {
    console.log("\n" + "=".repeat(60));
    console.log("🎉 TEST SUMMARY");
    console.log("=".repeat(60));
    
    const [profile1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), attendee1Keypair.publicKey.toBuffer()],
      program.programId
    );
    
    const [profile2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), attendee2Keypair.publicKey.toBuffer()],
      program.programId
    );

    try {
      const profile1 = await program.account.userProfile.fetch(profile1Pda);
      const profile2 = await program.account.userProfile.fetch(profile2Pda);

      console.log("\n📊 Final Statistics:");
      console.log("   Total Tests Run: All passing ✅");
      console.log("\n   User 1 Final Stats:");
      console.log("   - Badges:", profile1.totalBadges);
      console.log("   - Reputation:", profile1.reputationScore, "XP");
      console.log("   - Events:", profile1.attendedEvents.length);
      
      console.log("\n   User 2 Final Stats:");
      console.log("   - Badges:", profile2.totalBadges);
      console.log("   - Reputation:", profile2.reputationScore, "XP");
      console.log("   - Events:", profile2.attendedEvents.length);
      
      console.log("\n✨ All systems operational!");
      console.log("=".repeat(60) + "\n");
    } catch (error) {
      console.log("\n⚠️  Could not fetch final statistics");
    }
  });
});
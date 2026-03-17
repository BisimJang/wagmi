import os
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Course
from web3 import Web3

logger = logging.getLogger(__name__)

# Basic ABI needed just to call setCoursePrice
COURSE_CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "_courseId", "type": "uint256" },
            { "internalType": "uint256", "name": "_newFee", "type": "uint256" }
        ],
        "name": "setCoursePrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

@receiver(post_save, sender=Course)
def sync_course_price_to_blockchain(sender, instance, created, **kwargs):
    """
    Django Signal that triggers whenever a Course is saved (created or updated).
    Connects to the Sepolia testnet via Web3.py and sends a transaction to update
    the course price on the smart contract, removing the need for manual JS scripts.
    """
    
    # Check if necessary environment variables are set
    if not settings.WEB3_PROVIDER_URI or not settings.WEB3_CONTRACT_ADDRESS or not settings.WEB3_OWNER_PRIVATE_KEY:
        logger.error("Web3 configuration missing in settings. Skipping blockchain sync.")
        return

    try:
        # 1. Initialize Web3 connection
        w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))
        
        if not w3.is_connected():
            logger.error("Failed to connect to Ethereum node.")
            return

        # 2. Setup Account and Contract
        # Ensure the private key has the 0x prefix
        private_key = settings.WEB3_OWNER_PRIVATE_KEY
        if not private_key.startswith('0x'):
            private_key = f'0x{private_key}'
            
        account = w3.eth.account.from_key(private_key)
        contract = w3.eth.contract(address=settings.WEB3_CONTRACT_ADDRESS, abi=COURSE_CONTRACT_ABI)

        # 3. Convert Django Decimal price to Wei
        # Price in models is a DecimalField, convert it to float, then to Wei
        price_in_eth = float(instance.price)
        price_in_wei = w3.to_wei(price_in_eth, 'ether')

        logger.info(f"Syncing Course {instance.id} ('{instance.title}') to blockchain. Price: {price_in_eth} ETH")

        # 4. Build the transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Estimate gas or provide a reasonable default
        base_fee = w3.eth.get_block('latest')['baseFeePerGas']
        max_priority_fee = w3.to_wei(2, 'gwei')
        max_fee_per_gas = base_fee * 2 + max_priority_fee
        
        txn = contract.functions.setCoursePrice(
            instance.id, 
            price_in_wei
        ).build_transaction({
            'chainId': w3.eth.chain_id, # Should be 11155111 for Sepolia
            'gas': 100000,              # Enough gas for an unrestricted state change
            'maxFeePerGas': max_fee_per_gas,
            'maxPriorityFeePerGas': max_priority_fee,
            'nonce': nonce,
        })

        # 5. Sign and Send Transaction
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction) # Note: this is raw_transaction in v6+ Web3.py
        
        logger.info(f"Successfully submitted transaction for Course ID {instance.id}: {w3.to_hex(tx_hash)}")
        
    except Exception as e:
        logger.error(f"Failed to sync course {instance.id} to blockchain: {str(e)}")

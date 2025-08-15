// HyperFlow Presale with Privy Integration

class HyperFlowPresale {
    constructor() {
        this.privy = null;
        this.user = null;
        this.presaleData = {
            hardCap: 2000,
            tokensPerHype: 25000, // 1 HYPE = 25,000 FLOW tokens
            totalTokens: 50000000,
            raisedAmount: 0,
            participantCount: 0,
            tokensRemaining: 50000000
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing HyperFlow Presale with Privy...');
        
        // Initialize Privy
        await this.initPrivy();
        
        // Setup UI
        this.initLoadingBar();
        this.setupEventListeners();
        this.updateProgress();
        
        // Initialize timer
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        console.log('HyperFlow Presale initialized successfully');
    }

    async initPrivy() {
        try {
            // Wait for Privy Wallet Manager to load
            if (typeof window.PrivyWalletManager === 'undefined') {
                console.log('Waiting for Privy Wallet Manager to load...');
                await this.waitForPrivySDK();
            }

            // Initialize Privy Wallet Manager
            this.privy = new window.PrivyWalletManager();

            console.log('Privy Wallet Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Privy:', error);
            throw error;
        }
    }

    async waitForPrivySDK() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkSDK = () => {
                attempts++;
                if (typeof window.PrivyWalletManager !== 'undefined' && window.privySDKReady) {
                    console.log('Privy Wallet Manager loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Privy Wallet Manager failed to load'));
                } else {
                    setTimeout(checkSDK, 100);
                }
            };
            checkSDK();
        });
    }

    initLoadingBar() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingBar = document.getElementById('loadingBar');
                if (loadingBar) {
                    loadingBar.classList.add('hidden');
                    setTimeout(() => {
                        loadingBar.remove();
                    }, 500);
                }
            }, 1000);
        });
    }

    setupEventListeners() {
        const connectButton = document.getElementById('connectWallet');
        const disconnectButton = document.getElementById('disconnectWallet');
        const ethAmountInput = document.getElementById('ethAmount');
        const purchaseButton = document.getElementById('purchaseButton');

        if (connectButton) {
            connectButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.connectWallet();
            });
        }

        if (disconnectButton) {
            disconnectButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.disconnectWallet();
            });
        }

        if (ethAmountInput) {
            ethAmountInput.addEventListener('input', (e) => {
                this.updateConversion(e.target.value);
            });
        }

        if (purchaseButton) {
            purchaseButton.addEventListener('click', () => {
                this.purchaseTokens();
            });
        }
    }

    async connectWallet() {
        try {
            console.log('Opening Privy wallet selector...');
            
            if (!this.privy) {
                throw new Error('Privy not initialized');
            }

            // Show Privy wallet selector modal
            const { user, wallet } = await this.privy.connectWallet();
            
            this.user = user;
            this.updateWalletUI(true, user);
            this.showSuccess(`Connected ${wallet.walletClientType}! Address: ${wallet.address.substring(0, 8)}...${wallet.address.substring(36)}`);
            
        } catch (error) {
            if (error.message === 'User cancelled') {
                console.log('User cancelled wallet connection');
            } else {
                console.error('Wallet connection failed:', error);
                this.showError('Wallet connection failed. Please try again.');
            }
        }
    }





    async disconnectWallet() {
        try {
            console.log('Disconnecting wallet...');
            
            if (this.privy) {
                await this.privy.logout();
            }

            // Reset state
            this.user = null;
            this.updateWalletUI(false, null);
            this.showSuccess('Disconnected successfully');
            
        } catch (error) {
            console.error('Wallet disconnection failed:', error);
            this.showError('Failed to disconnect wallet');
        }
    }

    updateWalletUI(isConnected, user) {
        const connectContainer = document.getElementById('walletConnectionContainer');
        const connectedContainer = document.getElementById('walletConnectedContainer');
        const purchaseSection = document.getElementById('purchaseSection');
        const walletAddress = document.getElementById('walletAddress');

        if (isConnected && user) {
            // Show connected state
            connectContainer.style.display = 'none';
            connectedContainer.style.display = 'block';
            purchaseSection.style.display = 'block';

            // Display wallet address
            const address = user.wallet?.address || 'Unknown';
            const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
            walletAddress.textContent = shortAddress;
            walletAddress.title = address;

            console.log('Wallet connected:', address);
        } else {
            // Show disconnected state
            connectContainer.style.display = 'block';
            connectedContainer.style.display = 'none';
            purchaseSection.style.display = 'none';

            console.log('Wallet disconnected');
        }
    }

    updateConversion(hyypeAmount) {
        const flowTokens = parseFloat(hyypeAmount || 0) * this.presaleData.tokensPerHype;
        const tokenAmountElement = document.getElementById('tokenAmount');
        
        if (tokenAmountElement) {
            tokenAmountElement.textContent = `${flowTokens.toLocaleString()} FLOW tokens`;
        }
    }

    async purchaseTokens() {
        try {
            const ethAmount = document.getElementById('ethAmount').value;
            
            if (!ethAmount || parseFloat(ethAmount) <= 0) {
                this.showError('Please enter a valid HYPE amount');
                return;
            }

            if (parseFloat(ethAmount) < 0.01) {
                this.showError('Minimum purchase is 0.01 HYPE');
                return;
            }

            if (!this.user || !this.user.wallet) {
                this.showError('Please connect your wallet first');
                return;
            }

            console.log('Processing purchase:', ethAmount, 'HYPE');

            // Show loading state
            const purchaseButton = document.getElementById('purchaseButton');
            const originalText = purchaseButton.textContent;
            purchaseButton.textContent = 'Processing...';
            purchaseButton.disabled = true;

            // Simulate transaction processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo purposes, show success
            this.showSuccess(`Successfully purchased ${(parseFloat(ethAmount) * this.presaleData.tokensPerHype).toLocaleString()} FLOW tokens!`);

            // Update presale progress (demo)
            this.presaleData.raisedAmount += parseFloat(ethAmount);
            this.presaleData.participantCount += 1;
            this.updateProgress();

            // Reset form
            document.getElementById('ethAmount').value = '';
            this.updateConversion('');

            // Reset button
            purchaseButton.textContent = originalText;
            purchaseButton.disabled = false;

        } catch (error) {
            console.error('Purchase failed:', error);
            this.showError('Purchase failed. Please try again.');
            
            // Reset button
            const purchaseButton = document.getElementById('purchaseButton');
            purchaseButton.textContent = 'Purchase FLOW Tokens';
            purchaseButton.disabled = false;
        }
    }

    updateProgress() {
        const progressPercentage = (this.presaleData.raisedAmount / this.presaleData.hardCap) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressPercentageElement = document.getElementById('progressPercentage');
        const raisedAmountElement = document.getElementById('raisedAmount');

        if (progressFill) {
            progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
        }

        if (progressPercentageElement) {
            progressPercentageElement.textContent = `${progressPercentage.toFixed(1)}%`;
        }

        if (raisedAmountElement) {
            raisedAmountElement.textContent = `${this.presaleData.raisedAmount.toFixed(2)} HYPE`;
        }
    }

    updateTimer() {
        // Set presale end date (example: 30 days from now)
        const presaleEndDate = new Date();
        presaleEndDate.setDate(presaleEndDate.getDate() + 30);

        const now = new Date().getTime();
        const distance = presaleEndDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            transition: all 0.3s ease;
            ${type === 'error' ? 'background-color: #ef4444;' : 
              type === 'success' ? 'background-color: #10b981;' : 
              'background-color: #3b82f6;'}
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);

        // Allow manual close
        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// Initialize the presale when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing HyperFlow Presale...');
    new HyperFlowPresale();
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
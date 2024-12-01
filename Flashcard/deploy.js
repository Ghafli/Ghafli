const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    productionBranch: 'main',
    buildDir: 'public',
    distDir: 'dist',
    envFile: '.env.production'
};

// Helper to run commands
const run = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
        });
    });
};

// Main deployment function
async function deploy() {
    try {
        console.log('Starting deployment process...');

        // 1. Check if we're on production branch
        const branch = await run('git rev-parse --abbrev-ref HEAD');
        if (branch.trim() !== config.productionBranch) {
            throw new Error(`Must be on ${config.productionBranch} branch to deploy`);
        }

        // 2. Check for uncommitted changes
        const status = await run('git status --porcelain');
        if (status) {
            throw new Error('Working directory not clean. Commit or stash changes first.');
        }

        // 3. Check if .env.production exists
        if (!fs.existsSync(config.envFile)) {
            throw new Error(`${config.envFile} not found`);
        }

        // 4. Install dependencies
        console.log('Installing dependencies...');
        await run('composer install --no-dev --optimize-autoloader');
        await run('npm ci --production');

        // 5. Build frontend assets
        console.log('Building frontend assets...');
        await run('npm run build');

        // 6. Clear cache
        console.log('Clearing cache...');
        if (fs.existsSync('bootstrap/cache')) {
            fs.readdirSync('bootstrap/cache')
                .forEach(file => fs.unlinkSync(path.join('bootstrap/cache', file)));
        }

        // 7. Copy production environment file
        console.log('Setting up production environment...');
        fs.copyFileSync(config.envFile, '.env');

        // 8. Deploy to Firebase
        console.log('Deploying to Firebase...');
        await run('firebase deploy');

        console.log('Deployment completed successfully!');

    } catch (error) {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run deployment
deploy();

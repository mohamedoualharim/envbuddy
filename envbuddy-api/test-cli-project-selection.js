console.log('🧪 EnvBuddy Project Selection Demo\n');

console.log('The push and pull-vars commands now automatically prompt for project selection when no default is set.\n');

console.log('Example workflow:\n');

console.log('1. First-time push without a default project:');
console.log('$ envbuddy push .env');
console.log('⚠️  No default project set\n');
console.log('📋 Fetching your projects...\n');
console.log('? Select a project: (Use arrow keys)');
console.log('❯ my-awesome-app (123e4567-e89b-12d3-a456-426614174000)');
console.log('  another-project (987f6543-e21b-45d6-b789-123456789012)');
console.log('  test-project (456a7890-f12c-34d5-e678-901234567890)\n');
console.log('? Save as default project? (Y/n)');
console.log('✅ Default project set: my-awesome-app\n');
console.log('📤 Pushing .env to project my-awesome-app...');
console.log('Found 5 variable(s)');
console.log('✅ Environment variables pushed successfully!\n');

console.log('2. Pull-vars without a default project:');
console.log('$ envbuddy pull-vars -e production');
console.log('⚠️  No default project set\n');
console.log('📋 Fetching your projects...\n');
console.log('[Shows project selection menu]');
console.log('[User selects and saves as default]');
console.log('📥 Pulling variables for project my-awesome-app (production)...');
console.log('✅ Variables pulled successfully to .env\n');

console.log('Features:');
console.log('✓ Automatic detection of missing project ID');
console.log('✓ Fetches all available projects from API');
console.log('✓ Shows user-friendly list with project names and IDs');
console.log('✓ Option to save selection as default');
console.log('✓ Continues with original command after selection');
console.log('✓ Works for both push and pull-vars commands\n');

console.log('Edge cases handled:');
console.log('• No projects found → Shows helpful message to create one');
console.log('• API error → Shows error message and exits gracefully');
console.log('• User cancels selection → Command exits without error');
console.log('• -p flag provided → Skips selection and uses provided ID\n');

console.log('Benefits:');
console.log('• Improved first-time user experience');
console.log('• No need to manually find and set project ID');
console.log('• Reduces friction for new users');
console.log('• Still respects explicit -p flag when provided'); 
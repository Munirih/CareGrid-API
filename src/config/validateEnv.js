const requiredEnvVariables = [
'MONGODB_URI',
'JWT_SECRET',
'PORT'
];

const validateEnv = () => {
const missingVariables = requiredEnvVariables.filter(
(variable) => !process.env[variable]
);


if (missingVariables.length > 0) {
    console.error(
        'Missing required environment variables: ' + missingVariables.join(', ')
    );

    process.exit(1);
}

console.log('All required environment variables are set.');


};

module.exports = validateEnv;

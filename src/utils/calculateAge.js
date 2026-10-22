const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const dob = new Date(dateOfBirth);

    let age = today.getFullYear() - dob.getFullYear();

    const hasBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (
            today.getMonth() === dob.getMonth() &&
            today.getDate() >= dob.getDate()
        );

    if (!hasBirthdayPassed) {
        age--;
    }

    return age;
};

module.exports = calculateAge;
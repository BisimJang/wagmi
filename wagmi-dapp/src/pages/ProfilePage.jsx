import React, { useEffect, useState } from 'react';

const ProfilePage = ({ coreContract, currentAccount }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (coreContract && currentAccount) {
      coreContract.getStudentProfile(currentAccount)
        .then(setProfile)
        .catch(console.error);
    }
  }, [coreContract, currentAccount]);

  if (!currentAccount) {
    return <p>Please connect your wallet to view your profile</p>;
  }

  if (!profile || !profile.isRegistered) {
    return (
      <div className="form-container">
        <h2>Register as Student</h2>
        <form id="registrationForm">
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <button type="submit">Register</button>
        </form>
      </div>
    );
  }

  return (
    <div className="profile-header">
      <h2>Student Profile</h2>
      <div className="profile-info">
        <div>Name: {profile.name}</div>
        <div>Email: {profile.email}</div>
        <div>Wallet: {profile.wallet}</div>
        <div>Enrolled Courses: {profile.enrolledCourses.length}</div>
        <div>Completed Courses: {profile.completedCourses.length}</div>
      </div>
    </div>
  );
};

export default ProfilePage;

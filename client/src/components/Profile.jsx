import './Profile.css';

const Profile = () => {
  // Sample data (replace with your actual data)
  const profileData = {
    name: 'John Doe',
    coverImage: 'https://images.unsplash.com/photo-1528465424850-54d22f092f9d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    profileImage: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    posts: [
        
        { id: 1, text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minus consequatur ipsa maxime sed iste laudantium nostrum, officiis, alias commodi ipsam officia dignissimos dolor aperiam unde rem! Sunt optio architecto aut.' },
      { id: 2, text: 'Post 2' },
      // Add more posts as needed
    ],
  };

  return (
    <div className="feed">
        <h2>Profile</h2>

      {/* <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minus consequatur ipsa maxime sed iste laudantium nostrum, officiis, alias commodi ipsam officia dignissimos dolor aperiam unde rem! Sunt optio architecto aut.
      </p> */}

      {/* Profile Information */}
      <div className="profile-info">
        {/* Cover Image */}
        <div className="cover-image" style={{ backgroundImage: `url(${profileData.coverImage})` }}></div>

        {/* Profile Image */}
        <img className="profile-image" src={profileData.profileImage} alt="Profile" />

        {/* Name */}
        <h3>{profileData.name}</h3>
      </div>

      {/* User-created Posts */}
      <div className="user-posts">
        <h3>User Posts</h3>
        <ul>
          {profileData.posts.map((post) => (
            <li key={post.id}>{post.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

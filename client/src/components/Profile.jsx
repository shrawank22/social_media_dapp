import { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
	const [profileData, setProfileData] = useState();

	useEffect(() => {
		// Fetch profile data from localStorage
		const data = localStorage.getItem('profile');
		console.log("data : ", JSON.parse(data));
		if (data) {
			setProfileData(JSON.parse(data));
		}
	}, []);

	// Sample data (replace with your actual data)
	const userProfileData = {
		name: 'John Doe',
		coverImage: 'https://images.unsplash.com/photo-1528465424850-54d22f092f9d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		profileImage: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		posts: [

			{ id: 1, text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minus consequatur ipsa maxime sed iste laudantium nostrum, officiis, alias commodi ipsam officia dignissimos dolor aperiam unde rem! Sunt optio architecto aut.' },
			{ id: 2, text: 'Post 2' },
		],
	};

	return (
		<div className="feed mt-3">
			<div className="profile-info">
				<div className="cover-image" style={{ backgroundImage: `url(${userProfileData.coverImage})` }}></div>
				<img className="profile-image" src={userProfileData.profileImage} alt="Profile" />
			</div>


			<div className="bg-white overflow-hidden shadow rounded-lg border mt-3">
				<div className="px-4 py-3 sm:px-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						User Profile
					</h3>
					<p className="mt-1 max-w-2xl text-sm text-gray-500">
						This is some information about the user.
					</p>
				</div>
				<div className="border-t border-gray-200 px-4 py-3 sm:p-0">
					<dl className="sm:divide-y sm:divide-gray-200">
						<div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">
								Full name
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{profileData?.name || "-"}
							</dd>
						</div>
						<div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">
								Aadhaar Number
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{profileData?.aadhaarNo || "-"}
							</dd>
						</div>
						<div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">
								Date of Birth
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{profileData?.dob || "-"}
							</dd>
						</div>
						<div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">
								Gender
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{(profileData?.gender === 'F' ? "Female" : "Male") || "-"}
							</dd>
						</div>
						<div className="py-2 sm:py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">
								City
							</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
								{profileData?.city || "-"}
							</dd>
						</div>
					</dl>
				</div>
			</div>

			{/* User-created Posts */}
			<div className="user-posts mt-5">
				<h3>User Posts</h3>
				<ul>
					{userProfileData.posts.map((post) => (
						<li key={post.id}>{post.text}</li>
					))}
				</ul>
			</div>

		</div>
	);
};

export default Profile;

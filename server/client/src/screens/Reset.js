import React, { useEffect, useState } from 'react';
import authSvg from '../assets/auth.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Reset = ({ match }) => {
	const [formData, setFormData] = useState({
		password1: '',
		password2: '',
		token: '',
	});

	const { password1, password2, token } = formData;

	useEffect(() => {
		let token = match.params.token;
		if (token) {
			setFormData({ ...formData, token });
		}
	}, []);

	const handleChange = (text) => (e) => {
		setFormData({ ...formData, [text]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (password1 === password2 && password2 && password1) {
			axios
				.put(`${process.env.REACT_APP_API_URL}/passwords/reset`, {
					newPassword: password1,
					resetPasswordLink: token,
				})
				.then((res) => {
					setFormData({ ...formData, password1: '', password2: '' });
					toast.success(res.data.message);
				})
				.catch((err) => {
					toast.error(`Something went wrong. ${err.response.data.error}`);
				});
		} else {
			toast.error(`Passwords do not match.`);
		}
	};

	return (
		<div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
			<ToastContainer />
			<div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
				<div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
					<div className='mt-12 flex flex-col items-center'>
						<h1 className='text-2xl xl:text-3xl font-extrabold'>
							Reset your password
						</h1>

						<form
							className='w-full flex-1 mt-8 text-indigo-500'
							onSubmit={handleSubmit}
						>
							<div className='mx-auto max-w-xs relative'>
								<input
									type='password'
									placeholder='Enter new password'
									onChange={handleChange('password1')}
									value={password1}
									className='mb-3 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray:400 focus:bg-white'
								/>
								<input
									type='password'
									placeholder='Confirm new password'
									onChange={handleChange('password2')}
									value={password2}
									className='mb-3 w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray:400 focus:bg-white'
								/>
								<button
									type='submit'
									className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700'
								>
									Reset
								</button>
							</div>

							<div className='my-12 border-b text-center'>
								<div className='leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2'>
									Sign up with email or social networks
								</div>
							</div>

							<div className='flex flex-col items-center'>
								<Link
									to='/register'
									className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
								>
									Sign Up
								</Link>
							</div>
						</form>
					</div>
				</div>
				<div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
					<div
						className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
						style={{ backgroundImage: `url(${authSvg})` }}
					></div>
				</div>
			</div>
		</div>
	);
};

export default Reset;

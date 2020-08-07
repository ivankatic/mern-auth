import React from 'react';
import Auth from './Auth';
import { Link } from 'react-router-dom';

const Header = () => {
	return (
		<div className='ui secondary pointing menu'>
			<Link to='/' className='item'>
				Home
			</Link>
			<Link to='/following' className='item'>
				Following
			</Link>

			<div className='right menu'>
				<Auth />
			</div>
		</div>
	);
};

export default Header;

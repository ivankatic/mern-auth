import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Categories from './Categories';
import Following from './Following';
import Header from './Header';

const App = () => {
	return (
		<div className='ui container'>
			<BrowserRouter>
				<Header />
				<Route path='/' exact component={Categories} />
				<Route path='/following' exact component={Following} />
			</BrowserRouter>
		</div>
	);
};

export default App;

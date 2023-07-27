import React from 'react';
import ReactDOM from 'react-dom';

function App() {
	return (
		<div>
			<span>Hello World</span>
		</div>
	);
}

const rootDOM = document.querySelector('#root');
const root = ReactDOM.createRoot(rootDOM);
root.render(<App></App>);

console.log(React);
console.log(ReactDOM);
console.log(root);

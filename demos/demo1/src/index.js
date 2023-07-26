import React from 'react';
import ReactDOM from 'react-dom';

const jsx = (
	<div>
		<span>Hello World</span>
	</div>
);

const rootDOM = document.querySelector('#root');

const root = ReactDOM.createRoot(rootDOM);
root.render(jsx);

console.log(React);
console.log(jsx);
console.log(ReactDOM);
console.log(root);

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbol';
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElement,
	ElementType
} from 'shared/ReactTypes';

const ReactElement = (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement => {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'lec'
	};
	return element;
};

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	for (const confKey in config) {
		const val = config[confKey];
		if (confKey === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
		}
		if (confKey === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 判断是否是自己身上有prop，而不是原型上的prop
		if ({}.hasOwnProperty.call(config, confKey)) {
			props[confKey] = val;
		}
		// 这里的处理就为diff埋下伏笔（单节点/多节点—）
		const maybeChildrenLen = maybeChildren.length;
		if (maybeChildrenLen === 1) {
			props.children = maybeChildren[0];
		} else {
			props.children = maybeChildren;
		}
	}
	return ReactElement(type, key, ref, props);
};

// jsxDEV传入的后续几个参数与jsx不同
export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null;
	const props: Props = {};
	let ref: Ref = null;

	for (const confKey in config) {
		const val = config[confKey];
		if (confKey === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
		}
		if (confKey === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}
		// 判断是否是自己身上有prop，而不是原型上的prop
		if ({}.hasOwnProperty.call(config, confKey)) {
			props[confKey] = val;
		}
		// 这里的处理就为diff埋下伏笔（单节点/多节点—）
	}
	return ReactElement(type, key, ref, props);
};

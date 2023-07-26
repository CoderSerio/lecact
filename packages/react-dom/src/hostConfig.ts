export type Container = Element;
export type Instance = Element;

/** 创建 DOM */
export const createInstance = (type: string) => {
	// TODO: 处理props
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	child: Instance,
	parent: Instance | Container
) => {
	parent?.appendChild(child);
};

/** 插入 DOM 节点插入
 * 浏览器下等价于 parentDom.appendChild()
 * appendInitialChild 方法的实现与这个方法完全一样
 */
export const appendChildToContainer = appendInitialChild;

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

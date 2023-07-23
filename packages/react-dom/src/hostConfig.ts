export type Container = Element;
export type Instance = Element;

/** 创建 DOM */
export const createInstance = (type: string) => {
	// TODO: 处理props
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	parent: Instance | Container,
	child: Instance
) => {
	parent.appendChild(child);
};

export const appendChildToContainer = (
	child: Instance,
	container: Container
) => {
	container.appendChild(child);
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

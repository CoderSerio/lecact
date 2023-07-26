import { Props, Key, Ref, ReactElement } from 'shared/ReactTypes';
import { Flags, NoFlags } from './flags';
import { Container } from 'hostConfig';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';

/** Fiber节点类型，上面挂了非常多属性。
 *
 * 注意区别于 FiberRootNode 类型——它的 current 属性指向了fiber树的根节点
 *
 * 构造 fiberNode 时，只需要传递三个参数：
 * 1. workTag: fiberNode 可以支持的类型，比如 FunctionComponent 等
 * 2. props: 属性
 * 3. key: dddd
 */
export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;
	ref: Ref;

	memoizedProps: Props | null;
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;
	subtreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 以下是记录实例相关的属性，也就是 ReactElement 也具有的部分
		this.tag = tag;
		/** diff的键 */
		this.key = key;
		// DOM
		this.stateNode = null;
		// 类型
		this.type = null;

		// 以下是记录树状关系结构相关的属性
		// 父级节点
		this.return = null;
		// 右边的兄弟节点
		this.sibling = null;
		// 子节点
		this.child = null;
		// 作为子节点，在父级节点的子节点list中的下标
		this.index = 0;
		// 对自身的引用
		this.ref = null;

		// 以下是辅助作为工作单元相关的属性
		// 工作单元刚开始的时候的props
		this.pendingProps = pendingProps;
		// 更新完了之后的 props
		this.memoizedProps = null;
		// 更新完了之后的 state
		this.memoizedState = null;
		// workInProgress 和 current 树的节点相互指向
		this.alternate = null;
		// 副作用标签
		this.flags = NoFlags;
		// 子树的副作用标签
		this.subtreeFlags = NoFlags;
		// 更新队列
		this.updateQueue = null;
	}
}

/**
 * 用于切换 fiber 树的节点，具有一些重要的属性:
 *
 * 0. container: 在浏览器环境下 Container 就是 DOM 类型，这里做抽象是为了兼容更多环境
 * 1. current: 指向 current fiber 树 的根节点（hostRootFiber）
 * 2. finishedWork: 指向 workInProgress fiber 树 的根节点（hostRootFiber）
 *
 * 这里需要注意，fiber 树的跟节点（hostRootFiber）有一个 stateNode 可以访问 FiberRootNode
 */
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		// 相互指向对方
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

/**
 * 传入当前的 current fiber 树根节点， 返回对应的 workInProgress fiber tree
 */
export function createWorkInProgress(
	current: FiberNode,
	pendingProps: Props
): FiberNode {
	// workInProgress 的缩写
	let wip = current.alternate;
	if (wip === null) {
		// 传入的是 ReactElement 具有的基本属性，其余属性自己手动赋值
		wip = new FiberNode(current.tag, pendingProps, current.key);

		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// alternate 的过程：
		// 清除缓存（副作用和参数），因为它们可能是上一次更新遗留下来的
		wip.flags = NoFlags;
		wip.pendingProps = pendingProps;
	}
	wip.type = current.type;
	wip.memoizedState = current.memoizedState;
	wip.memoizedProps = current.memoizedProps;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	return wip as FiberNode;
}

/** 根据 ReactElement 创建 fiber */
export function createFiberFromElement(elemenet: ReactElement) {
	const { type, key, props } = elemenet;
	// 默认是函数组件
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		// 对于单个标签，像是 <div/> 这样的，类型就是 'div' 字符串
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', elemenet);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}

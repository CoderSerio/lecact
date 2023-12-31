import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbol';
import { ReactElement } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './flags';
import { HostText } from './workTags';

/** 通用的子节点协调方法，内部创建了闭包，提供多个协调方法 */
function ChildReconciler(shouldTrackEffects: boolean) {
	/** 单节点协调 */
	const reconcileSingleElement = (
		parentFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElement
	) => {
		const fiber = createFiberFromElement(element);
		fiber.return = parentFiber;
		return fiber;
	};

	/** 协调文本节点 */
	const reconcileSingleTextNode = (
		parentFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) => {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = parentFiber;
		return fiber;
	};

	/** 插入节点
	 * 由于我们这里传入的 fiber 是 workInProgress FiberNode
	 * 所以 fiber.alternate 就是 current FiberNode
	 */
	const placeSingleChild = (fiber: FiberNode) => {
		if (shouldTrackEffects && fiber.alternate === null) {
			// 由于操作类型是二进制表示的，这里需要把后面的几位全部取 1
			fiber.flags |= Placement;
		}
		return fiber;
	};

	/** 相当于协调的 main 函数，判断不同的类型，选择不同的协调方法 */
	function reconcileChildrenFibers(
		parentFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					const newFiber = reconcileSingleElement(
						parentFiber,
						currentFiber,
						newChild
					);
					return placeSingleChild(newFiber);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
			}
		}

		if (typeof newChild === 'string' || typeof newChild === 'number') {
			const newFiber = reconcileSingleTextNode(
				parentFiber,
				currentFiber,
				newChild as string | number
			);
			return placeSingleChild(newFiber);
		}

		if (__DEV__) {
			console.warn('未实现的类型', newChild);
			return;
		}
		return null;
	}
	return reconcileChildrenFibers;
}

/** 和 mountChildFibers 类似，但是会追踪副作用 */
export const reconcileChildFibers = ChildReconciler(true);
/** 和 reconcileChildFibers 类似，但是不会追踪副作用 */
export const mountChildFibers = ChildReconciler(false);

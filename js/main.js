var currentLevel = config.middle

const dx = [-1, -1, -1, 0, 0, 1, 1, 1]
const dy = [-1, 0, 1, -1, 1, -1, 0, 1]

main()


/**
 * ===========================================================================
 */
function main() {
	var mineArea = null; // html中的mineArea,js
	var mineArr = null; // 地雷index集合,js
	var tableData = null; // 表格信息
	var flagNum = 0; // 需要扫雷的数量
	var checkedGrid = 0;
	var success = false;

	// 初始化	
	init();
	// 绑定游戏事件
	bindEvent();
	// 允许点击
	bindMineAreaStart(0);
}


/**
 * 重置当前游戏
 */
function reset() {
	mineArea.innerText = ""
	init()
	bindMineAreaEvent(0)
	
}


/**
 * 绑定mineArea事件
 */
function bindMineAreaEvent(type) {
	// start-0表示可接触，1表示不可接触
	type == 0 ? bindMineAreaStart() : mineArea.onmousedown = null
}


/**
 * 允许触摸mineArea事件绑定
 */
function bindMineAreaStart() {
	mineArea.onmousedown = function (event) {
		// event-target表明事件源，button，td......
		// 如果是旗子，无论左右键都把他消除掉
		var target = event.target
		if (target.classList.contains("flag")) {
			target.classList.remove("flag")
			target.parentNode.style.border = "2px solid"	// 点击去掉边界 在父节点编辑
			target.parentNode.style.borderColor = "#ffffff #a1a1a1 #a1a1a1 #ffffff"
			++flagNum
			$("#leftFlagNum").innerText = flagNum
		}
		// 0 左键
		else if (event.button === 0) {
			search(target)
		} else {
			addFlag(target)
		}
	}
}


/**
 * 初始化
 */
function init() {
	mineArea = $(".mineArea")
	$("#leftFlagNum").innerText = currentLevel.mineNum
	$(".gridSizeDesc").innerText = currentLevel.row + "x" + currentLevel.col
	$(".mineNumDesc").innerText = currentLevel.mineNum
	$(".gameBar>button").innerText = "重置"
	initMine()
	initMineArea()
}


/**
 * 生成地雷
 */
function initMine() {
	var arr = new Array(currentLevel.row * currentLevel.col)
	for (var i = 0; i < arr.length; ++i) {
		arr[i] = i;
	}
	arr.sort(() => 0.5 - Math.random())
	mineArr = arr.slice(0, currentLevel.mineNum)
}


/**
 * 初始化格子
 */
function initMineArea() {
	success = true
	flagNum = currentLevel.mineNum
	checkedGrid = 0
	$("#leftFlagNum").innerText = flagNum

	// 使用新的js对象记录dom元素的内容
	tableData = new Array(currentLevel.row)
	var index = 0

	var table = document.createElement('table')
	for (var i = 0; i < currentLevel.row; ++i) {
		var tr = document.createElement('tr')
		var trData = new Array(currentLevel.col)
		for (var j = 0; j < currentLevel.col; ++j) {
			var td = document.createElement('td')
			var div = document.createElement('div')
			td.appendChild(div)
			div.dataset.id = index
			div.classList.add('canAddFlag') // 默认都可以添加🚩
			tr.appendChild(td)

			// 添加组件数据
			var tdData = {
				index: index, // 一维数组索引
				mine: false, // 是否是雷
				flag: false, // 是否有flag
				value: -1, // 周围雷的数量
				checked: false // 用于表示是否被检查过
			}
			if (mineArr.includes(index)) {
				tdData.mine = true
				div.classList.add("mine")
			}
			trData[j] = tdData
			++index;
		}
		tableData[i] = trData
		table.appendChild(tr)
	}
	mineArea.appendChild(table)
}



/**
 * 绑定事件
 */
function bindEvent() {
	// js绑定事件的两种方法
	// js中 $(类选择器).onclick = function (event)
	// html中onclick=functionname(),js中function functionName
	mineArea = $(".mineArea")

	// 阻止右键弹出浏览器默认工具栏
	mineArea.oncontextmenu = function (event) {
		event.preventDefault()
	}

	// 切换游戏难度事件
	var levelChoiceBtns = $$(".levelChoice>button")
	$(".levelChoice").onclick = function (event) {
		// 根据点击的事件源的innerText判断难度级别的选择
		var level = event.target.innerText
		switch (level) {
			case "easy": {
				currentLevel = config.easy
				reset()
				break
			}
			case "middle": {
				currentLevel = config.middle
				reset()
				break
			}
			case "hard": {
				currentLevel = config.hard
				reset()
				break
			}
			default: {
				return
			}
		}
		// 消去active标红，为切换新的level标签标红做准备
		for (var i = 0; i < levelChoiceBtns.length; ++i) {
			if (levelChoiceBtns[i].classList.contains("active")) {
				levelChoiceBtns[i].classList.remove("active")
				break
			}
		}
		event.target.classList.add("active")
	}
}


function checkGameOver() {
	if(checkedGrid == currentLevel.row * currentLevel.col - currentLevel.mineNum) {
		success = true
		return true
	}
	return false
}


/**
 * 左键搜索格子范围
 */
function search(target) {
	var targetId = target.dataset.id
	// step1: 是雷，over

	// x
	// !!includes 本质用于检查比较的对象引用是否相同，而不是值是否相同
	// if(mineArr.includes(targetId)) {
	// 	gameOver()
	// }

	// √
	for (var i = 0; i < mineArr.length; ++i) {
		if (mineArr[i] == targetId) {
			success = false;
			gameOver()
			return
		}
	}

	// step2:周围有雷，显示数字
	var rowIndex = Math.floor(targetId / currentLevel.row)
	var colIndex = targetId % currentLevel.col
	expand(rowIndex, colIndex)
	if(checkGameOver()) {
		gameOver()
	}
}


/**
 * 从指定格子扩张
 */
function expand(i, j) {
	// 超出边界，退出
	if (i < 0 || i == currentLevel.row || j < 0 || j == currentLevel.col) {
		return;
	}

	var divArr = $$("td>div")
	var target = divArr[tableData[i][j].index]

	// 已经标记过是符合要求的，退出
	if(tableData[i][j].checked) {
		return;
	}

	// 是个格子且没有被检查过，则可以获取周围的雷的数量
	target.parentNode.style.borderColor = "#a1a1a1 #a1a1a1 #a1a1a1 #a1a1a1" // 点击去掉边界 在父节点编辑
	target.classList.remove("canAddFlag")
	tableData[i][j].checked = true
	++checkedGrid

	var aroundMineNum = aroundMine(i, j)
	tableData[i][j].value = aroundMineNum
	// 周围没有雷的格子才可以扩张
	if (aroundMineNum === 0) {
		for (var k = 0; k < 8; ++k) {
			expand(i + dx[k], j + dy[k])
		}
	} else {
		target.innerText = aroundMineNum
		target.classList.add(findMineDescClass(aroundMineNum))
	}
}


/**
 * 判断指定格子周围是否有雷
 */
function aroundMine(i, j) {
	if(tableData[i][j].value != -1) 
		return tableData[i][j].value

	var mineNum = 0;
	for (var k = 0; k < 8; ++k) {
		mineNum += tdHasMine(i + dx[k], j + dy[k])
	}
	return mineNum
}


/**
 * 是否是雷
 */
function tdHasMine(i, j) {
	if (i < 0 || i == currentLevel.row || j < 0 || j == currentLevel.col) {
		return 0;
	}
	return tableData[i][j].mine ? 1 : 0
}


/**
 * 右键插旗
 */
function addFlag(target) {
	// 对于存在多种class选择器的dom元素，可以使用contains函数判断是否存在某一类选择器
	// 当指定格子可以添加旗子并且还没添加旗子的时候，才可以加旗子
	if (target.classList.contains("canAddFlag") && !target.classList.contains("flag") && flagNum > 0) {
		target.classList.add("flag")
		target.parentNode.style.border = "none"
		--flagNum
		$("#leftFlagNum").innerText = flagNum
	}
}


/**
 * 游戏结束处理函数
 */
function gameOver() {
	showAllMine()
	success? $(".gameBar>button").innerText = "成功" : $(".gameBar>button").innerText = "失败"
	bindMineAreaEvent(1)
}


/**
 * 展现所有地雷
 */
function showAllMine() {
	var mineDomArr = $$("td>div.mine")
	for (var i = 0; i < mineDomArr.length; ++i) {
		// 通过js动态修改css样式 dom.style.attribute-name
		mineDomArr[i].style.opacity = 1
		// boarder = none
	}
}



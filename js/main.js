var currentLevel = config.middle

/**
 * 游戏主逻辑调用
 */
main()


/**
 * ===========================================================================
 * 所用函数
 */

/**
 * 游戏主逻辑函数
 */
function main() {
	// .xxx class选择器
	var mineArea = null; // html中的mineArea,js
	var mineArr = null; // 地雷index集合,js
	var mineNum = null; // 地雷的总数
	var tableData = null; // 表格信息
	var flagNum = 0; // 当前旗子的数量
	var hasReseted = false; //表明之前是否被重置过，为start做准备
	
	// 初始化	
	init();
	// 绑定游戏事件
	bindEvent();
	// 允许点击
	bindMineAreaStart(0);
}


// /**
//  * 开始游戏
//  */
// function start() {
// 	if(!hasReseted) {
// 		mineArea.innerText = ""
// 		init()
// 	} else {
// 		hasReseted = false
// 	}
// 	// 绑定格子点击事件,由于游戏开始结束点击限制，不能放在bindEvent上
// 	bindMineAreaEvent(0)
// }


/**
 * 重置当前游戏
 */
function reset() {
	mineArea.innerText = ""
	init()
	bindMineAreaEvent(0)
	// hasReseted = true
	$("#usedFlagNum").innerText = 0
}


/**
 * 绑定mineArea事件
 * @param {Object} type
 */
function bindMineAreaEvent(type) {
	// start-0表示可接触，1表示不可接触
	type == 0? bindMineAreaStart() : mineArea.onmousedown = null
}


/**
 * 允许触摸mineArea事件绑定
 */
function bindMineAreaStart() {
	mineArea.onmousedown = function (event) {
		// event-target表明事件源，button，td......
		// 如果是旗子，无论左右键都把他消除掉
		var target = event.target
		if(target.classList.contains("flag")) {
			target.classList.remove("flag")
			target.parentNode.style.border = "2px solid"	// 点击去掉边界 在父节点编辑
			target.parentNode.style.borderColor = "#ffffff #a1a1a1 #a1a1a1 #ffffff"
			--flagNum
			$("#usedFlagNum").innerText = flagNum
		}
		// 0 左键
		else if(event.button === 0) {
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
	initMine()
	initMineArea()
	initRelvantNum()
}


/**
 * 生成地雷
 */
function initMine() {
    var arr = new Array(currentLevel.row*currentLevel.col)
    for(var i=0;i<arr.length;++i) {
        arr[i] = i;
    }
    arr.sort(()=>0.5-Math.random())
    mineArr = arr.slice(0,currentLevel.mineNum)
}


/**
 * 初始化格子
 */
function initMineArea() {
	flagNum = 0                 // 为什么这个放在main中不可以
	// 使用新的js对象记录dom元素的内容
	tableData = new Array(currentLevel.row)
	
	// 生成格子
    var table = document.createElement('table')
	// 记录下标
	var index = 0
    for(var i=0;i<currentLevel.row;++i) {
        var tr = document.createElement('tr')
		var trData = new Array(currentLevel.col)
        for(var j=0;j<currentLevel.col;++j) {
			// 添加组件单元
            var td = document.createElement('td')
			var div = document.createElement('div')
			td.appendChild(div)
			div.dataset.id = index
			div.classList.add('canAddFlag') // 默认都可以添加🚩
			tr.appendChild(td)
			
			// 添加组件数据
			var tdData = {
				mine: false, // 是否是雷
				flag: false, // 是否有flag
				value: 0, // 周围雷的数量
				index: index, // 一维数组索引
				checked: false // 用于表示是否被检查过
			}
			if(mineArr.includes(index)) {
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
 * 初始化相应的数据
 */
function initRelvantNum() {
	// 给span标签添加内容，删除内容 innerText/innerHtml
	var gridSizeDescStr = currentLevel.row + "x" + currentLevel.col
	$(".gridSizeDesc").innerText = gridSizeDescStr
	$(".mineNumDesc").innerText = currentLevel.mineNum
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
	var levelChoiceBtns = $$(".levelChoice>button") //>
	$(".levelChoice").onclick = function(event) {
		// 根据点击的事件源的innerText判断难度级别的选择
		var level = event.target.innerText
		switch(level) {
			case "easy": {
				currentLevel = config.easy
				mineArea.innerText = ""
				init()
				break
			}
			case "middle": {
				currentLevel = config.middle
				mineArea.innerText = ""
				init()
				break
			}
			case "hard": {
				currentLevel = config.hard
				mineArea.innerText = ""
				init()
				break
			}
			default: {
				return
			}
		}
		
		// 消去active标红，为切换新的actice标签做准备
		for(var i=0;i<levelChoiceBtns.length;++i) {
			if(levelChoiceBtns[i].classList.contains("active")) {
				levelChoiceBtns[i].classList.remove("active")
				break
			}
		}
		event.target.classList.add("active")
	}
}


/**
 * 左键搜索格子范围
 * @param {Object} target
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
	for(var i=0;i<mineArr.length;++i) {
		if(mineArr[i] == targetId) {
			gameOver()
			return
		}
	}
	
	// step2:周围有雷，显示数字
	var rowIndex = Math.floor(targetId/currentLevel.row)
	var colIndex = targetId%currentLevel.col
	expand(rowIndex,colIndex)
}

/**
 * 从指定格子扩张
 * @param {Object} i
 * @param {Object} j
 */
function expand(i,j) {
	// 超出边界，退出
	if(i<0||i==currentLevel.row||j<0||j==currentLevel.col) {
		return;
	}
	// 已经标记过是符合要求的，退出
	if(tableData[i][j].checked) {
		return;
	}
	// 是个格子且没有被检查过，则可以获取周围的雷的数量
	var aroundMineNum = aroundMine(i,j)
	var divArr = $$("td>div")
	var target = divArr[tableData[i][j].index]
	target.parentNode.style.borderColor = "#a1a1a1 #a1a1a1 #a1a1a1 #a1a1a1" // 点击去掉边界 在父节点编辑
	target.classList.remove("canAddFlag")
	if(aroundMineNum === 0) {
		tableData[i][j].checked = true
		expand(i-1,j-1)
		expand(i-1,j)
		expand(i-1,j+1)
		expand(i,j-1)
		expand(i,j+1)
		expand(i+1,j-1)
		expand(i+1,j)
		expand(i+1,j+1)
	} else {
		tableData[i][j].value = aroundMineNum
		tableData[i][j].checked = true
		target.innerText = aroundMineNum
		target.classList.add(findMineDescClass(aroundMineNum))
	}
}

/**
 * 判断指定格子周围是否有雷
 * @param {Object} i,j
 */
function aroundMine(i,j) {
	return tdHasMine(i-1,j-1) +
	tdHasMine(i-1,j) +
	tdHasMine(i-1,j+1) +
	tdHasMine(i,j-1) +
	tdHasMine(i,j+1) +
	tdHasMine(i+1,j-1) +
	tdHasMine(i+1,j) +
	tdHasMine(i+1,j+1)
}


/**
 * 是否是雷
 * @param {Object} i
 * @param {Object} j
 */
function tdHasMine(i,j) {
	if(i<0||i==currentLevel.row||j<0||j==currentLevel.col) {
		return 0;
	}
	return tableData[i][j].mine? 1 : 0
}

/**
 * 右键插旗
 * @param {Object} target
 */
function addFlag(target) {
	// 对于存在多种class选择器的dom元素，可以使用contains函数判断是否存在某一类选择器
	// contains
	// 当指定格子可以添加旗子并且还没添加旗子的时候，才可以加旗子
	if(target.classList.contains("canAddFlag")&&!target.classList.contains("flag")) {
		if(flagNum < config.flagAll) {
			target.classList.add("flag")
			target.parentNode.style.border = "none"	// 点击去掉边界 在父节点编辑
			++flagNum
			$("#usedFlagNum").innerText = flagNum
		}
	}
}

/**
 * 游戏结束处理函数
 */
function gameOver() {
	showAllMine()
	bindMineAreaEvent(1)
}

/**
 * 展现所有地雷
 */
function showAllMine() {
	var mineDomArr = $$("td>div.mine")
	for(var i=0;i<mineDomArr.length;++i) {
		// 通过js动态修改css样式 dom.style.attribute-name
		mineDomArr[i].style.opacity = 1
		// boarder = none
	}
}



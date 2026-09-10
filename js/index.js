//预备数据，只有第一次打开页面、且 localStorage 里是空的时才会用到
var mockData = [
  { id:1, owner:'张三', phone:'13800138001', plateNo:'京A12345', brand:'大众', startDate:'2026-01-01', endDate:'2026-12-31', amount:1200, payType:'微信', status:0 },
  { id:2, owner:'李四', phone:'13900139002', plateNo:'京B67890', brand:'丰田', startDate:'2026-03-15', endDate:'2027-03-14', amount:1500, payType:'支付宝', status:0 },
  { id:3, owner:'王五', phone:'13700137003', plateNo:'京C11111', brand:'宝马', startDate:'2025-06-01', endDate:'2025-12-31', amount:1300, payType:'现金', status:1 }
];

//=============================================================读数据
function loadData() {
  var s = localStorage.getItem('monthCardData');  //去浏览器的 localStorage 里找叫 'monthCardData' 的东西
  if (!s) {    //没找到，把预备数据写入 localStorage 作为初始数据
    localStorage.setItem('monthCardData', JSON.stringify(mockData));  //JS 数组 → 字符串
    return mockData;
  }
  return JSON.parse(s);  //返回解析后的 JSON 数据，字符串 → 还原回 JS 数组
}

//=============================================================渲染首页统计数据
function renderHomeStat() {
  var list = loadData(); //读入所有月卡数据

  document.getElementById('statTotal').innerText = list.length;//用数组长度替换statTotal的0

  var totalAmount = list.reduce(function(sum, item) {   //累加，得到总金额
    return sum + Number(item.amount);//sum：累加和，item.amount：当前循环到的金额，转换为数字类型
  }, 0);

  //将总金额转换为千分位格式后写入 id="statAmount" 的元素
  document.getElementById('statAmount').innerText = totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//=============================================================页面加载时执行
window.onload = function() {
  renderHomeStat();
};

/*
浏览器打开 index.html
  ↓
所有资源加载完毕
  ↓
window.onload 触发
  ↓
renderHomeStat()
  ↓
  ├─ loadData() → localStorage 读数据（没有就用 mockData 初始化）
  ├─ list.length → 填进"月卡总数"卡片
  └─ reduce 累加 amount → 千分位格式化 → 填进"累计收费"卡片
*/
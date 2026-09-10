var list = [];
var editId = null;
var originalData = null;

//=============================================================数据保存和加载
function saveData() {
  localStorage.setItem('monthCardData', JSON.stringify(list));
}
function loadData() {
  var s = localStorage.getItem('monthCardData');
  return s ? JSON.parse(s) : [];  //返回JSON 数据，没有数据时返回空数组
}

//=============================================================数据验证
function validate(d) {
  if (!d.owner) return '请输入车主姓名';
  if (!d.phone) return '请输入联系方式';
  if (!d.plateNo) return '请输入车辆号码';
  if (!d.startDate) return '请选择开始日期';
  if (!d.endDate) return '请选择结束日期';
  if (!d.amount) return '请输入支付金额';
  if (!d.payType) return '请选择支付方式';
  if (!/^1\d{10}$/.test(d.phone)) return '手机号格式不正确（11位数字，以1开头）';
  if (!/^[\u4e00-\u9fa5][A-Z][A-HJ-NP-Z0-9]{5,6}$/.test(d.plateNo)) return '车牌号码格式不正确（如 京A12345）';
  if (Number(d.amount) <= 0) return '支付金额必须为正数';
  if (new Date(d.endDate) < new Date(d.startDate)) return '结束日期不能早于开始日期';
  return '';
}

//=============================================================提交表单
function onSubmit() {
  var d = { //收集表单数据，转换为对象 d
    owner:    document.getElementById('owner').value.trim(),
    phone:    document.getElementById('phone').value.trim(),
    plateNo:  document.getElementById('plateNo').value.trim(),
    brand:    document.getElementById('brand').value.trim(),
    startDate:document.getElementById('startDate').value,
    endDate:  document.getElementById('endDate').value,
    amount:   document.getElementById('amount').value,
    payType:  document.getElementById('payType').value
  };

  var err = validate(d); //校验
  if (err) {
    document.getElementById('errMsg').innerText = err;  //显示错误
    return; //直接整个终止函数，不保存数据
  }
  document.getElementById('errMsg').innerText = ''; //清空错误提示

  var now = new Date(); now.setHours(0,0,0,0);
  var end = new Date(d.endDate); end.setHours(0,0,0,0);
  d.status = end >= now ? 0 : 1;

  if (editId) {  // 编辑模式：找到旧数据的位置，替换
    var idx = list.findIndex(function(i) { return i.id === editId; }); //找到旧数据的位置
    if (idx !== -1) { //如果找到
      d.id = editId; //保持旧数据的 id 不变
      list[idx] = d; //用新数据替换旧数据
    }
  } else {  // 新增模式：生成新 id 并添加到列表
    d.id = Date.now(); //获取时间戳，作为新增数据的唯一 id，保证 id 不会重复
    list.push(d);      //将新增数据添加到列表
  }

  saveData();
  location.href = 'monthCard.html';
}

//=============================================================重置表单
function onReset() {
  if (originalData) {// 判断：如果是编辑模式（originalData存有这条月卡原来的数据),把表单恢复成【编辑前原始数据】
    document.getElementById('owner').value = originalData.owner || '';
    document.getElementById('phone').value = originalData.phone || '';
    document.getElementById('plateNo').value = originalData.plateNo || '';
    document.getElementById('brand').value = originalData.brand || '';
    document.getElementById('startDate').value = originalData.startDate || '';
    document.getElementById('endDate').value = originalData.endDate || '';
    document.getElementById('amount').value = originalData.amount || '';
    document.getElementById('payType').value = originalData.payType || '';
  } else {// 新增模式：没有原始数据，全部清空表单
    var inputs = document.querySelectorAll('input:not([type="date"]), select');
    inputs.forEach(function(i) { i.value = ''; });
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
  }
  document.getElementById('errMsg').innerText = '';// 无论新增还是编辑，重置时都清空错误提示
}

//=============================================================页面加载时执行
window.onload = function() {
  list = loadData();

  var params = new URLSearchParams(location.search);// 解析 URL 里的 ?id=xxx
  var idStr = params.get('id');//取出id后面的值，是字符串类型

  if (idStr) { // 如果有 id 参数，说明编辑模式
    editId = Number(idStr); 
    document.getElementById('pageTitle').innerText = '编辑月卡'; 
    var item = list.find(function(i) { return i.id === editId; });
    if (item) { // 如果找到这条数据,回显旧数据
      originalData = item;
      document.getElementById('owner').value = item.owner;
      document.getElementById('phone').value = item.phone;
      document.getElementById('plateNo').value = item.plateNo;
      document.getElementById('brand').value = item.brand;
      document.getElementById('startDate').value = item.startDate;
      document.getElementById('endDate').value = item.endDate;
      document.getElementById('amount').value = item.amount;
      document.getElementById('payType').value = item.payType;
    }
  }
  // 如果网址没有id，不进if分支，就是【新增月卡】模式，表单保持空白
};
/*
浏览器打开 addMonthCard.html
  ↓
window.onload 触发
  ↓
解析 URL：有没有 ?id=xxx ？
  ├─ 有 → 编辑模式 → 回填表单 → 标题改"编辑月卡"
  └─ 没有 → 新增模式 → 表单全空
  
用户填表单 → 点确定
  ↓
onSubmit()
  ↓
validate(d) 校验
  ├─ 不通过 → 在页面下方显示红色错误提示，停下
  └─ 通过
      ↓
      算 status（用结束日期和今天比）
      ↓
      editId 有值？
        ├─ 有 → 替换 list[idx]
        └─ 没有 → list.push(d)，id = Date.now()
      ↓
      saveData() → localStorage
      ↓
      location.href = 'monthCard.html' → 跳回列表 
*/
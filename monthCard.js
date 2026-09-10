var list = [];           // localStorage 里读出来的完整数据
var filteredList = [];   // 搜索/筛选后得到的数据（分页基于这个）
var currentPage = 1;     // 当前第几页
var pageSize = 5;        // 每页几条
var editMode = 'edit';   // 弹窗模式：'edit' 编辑 或 'renew' 续费
var currentEditId = null;// 当前正在操作的那条数据的 id
var totalPage = 1;       // 总页数（会根据数据量自动重算）

//=============================================================数据保存和加载
function saveData() {
  localStorage.setItem('monthCardData', JSON.stringify(list));
}
function loadData() {
  var s = localStorage.getItem('monthCardData');
  return s ? JSON.parse(s) : [];
}

//=============================================================计算剩余天数
function calcRemain(endDate) {
  var now = new Date(); now.setHours(0,0,0,0);
  var end = new Date(endDate); end.setHours(0,0,0,0);
  var ms = end.getTime() - now.getTime();
  var days = Math.ceil(ms / 86400000); // 除以一天的毫秒数，向上取整
  return days <= 0 ? 0 : days; // 如果过期，返回0天
}

//=============================================================渲染表格
function renderTable() {
  var tb = document.getElementById('tb');
  tb.innerHTML = ''; // 清空表格内容

  totalPage = Math.max(1, Math.ceil(filteredList.length / pageSize)); // 计算总页数
  if (currentPage > totalPage) currentPage = totalPage; // 确保当前页不超出范围

  var s = (currentPage - 1) * pageSize; // 计算当前页的起始索引
  var pageData = filteredList.slice(s, s + pageSize); // 从 filteredList 中提取当前页数据

  if (pageData.length === 0) { // 如果当前页没有数据
    tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:60px;color:#c0c4cc">暂无数据</td></tr>';
  } else { // 如果当前页有数据，渲染表格，遍历当前页每条数据，动态拼出 <tr> 塞到 tbody 里
    pageData.forEach(function(item, idx) {
      var tr = document.createElement('tr');
      var statusHtml = item.status === 0
        ? '<span class="tag-ok">可用</span>'
        : '<span class="tag-end">已过期</span>';
      tr.innerHTML =
        '<td><input type="checkbox" class="rowC" value="' + item.id + '"></td>' +
        '<td>' + (s + idx + 1) + '</td>' +
        '<td>' + item.owner + '</td>' +
        '<td>' + item.phone + '</td>' +
        '<td>' + item.plateNo + '</td>' +
        '<td>' + item.brand + '</td>' +
        '<td>' + calcRemain(item.endDate) + '天</td>' +
        '<td>' + statusHtml + '</td>' +
        '<td>' +
          '<a class="op" onclick="openV(' + item.id + ')">查看</a>' +
          '<a class="op" onclick="openR(' + item.id + ')">续费</a>' +
          '<a class="op" onclick="openE(' + item.id + ')">编辑</a>' +
          '<a class="op" onclick="onDel(' + item.id + ')">删除</a>' +
        '</td>';
      tb.appendChild(tr); // 追加到 tbody 里
    });
  }

  document.getElementById('pageInfo').innerText = 
    '共 ' + filteredList.length + ' 条，第 ' + currentPage + '/' + totalPage + ' 页';// 更新分页信息
}

//=============================================================搜索/筛选
function onSearch() {
  var plate = document.getElementById('qPlate').value.trim(); // 获取搜索框的车牌号，去掉首尾空格
  var status = document.getElementById('qStatus').value; // 获取搜索框的状态

  filteredList = list.filter(function(item) { // 过滤出符合搜索条件的数据
    var matchPlate = !plate || item.plateNo.indexOf(plate) !== -1; // 搜索车牌号，模糊匹配
    var matchStatus = status === '' || String(item.status) === status; // 搜索状态
    return matchPlate && matchStatus;
  });

  currentPage = 1;
  renderTable(); // 渲染表格，显示搜索结果
}

//=============================================================重置搜索/筛选
function onReset() {
  document.getElementById('qPlate').value = '';
  document.getElementById('qStatus').value = '';
  filteredList = list.slice(); // 重置搜索/筛选，// 复制完整数组
  currentPage = 1;
  renderTable();
}

//=============================================================跳转页码
function goPage(n) {
  if (n < 1 || n > totalPage) return;
  currentPage = n;
  renderTable();
}
//=============================================================切换每页条数
function changeSize() {
  pageSize = pageSize === 5 ? 10 : 5; //5 ↔ 10 来回切换
  currentPage = 1;
  renderTable();
}
//=============================================================全选/取消全选
function toggleAll(cb) {
  var cbs = document.querySelectorAll('.rowC'); // 获取所有行复选框
  cbs.forEach(function(c) { c.checked = cb.checked; }); // 全选/取消全选
}
//=============================================================关闭弹窗
function closeMask(id) {
  document.getElementById(id).classList.remove('show');
}
//=============================================================打开弹窗
function openMask(id) {
  document.getElementById(id).classList.add('show');
}
//=============================================================查看月卡详情
function openV(id) {
  var item = list.find(function(i) { return i.id === id; }); // 查找 id 对应的月卡数据
  if (!item) return; // 如果没有找到对应数据，直接返回
  document.getElementById('vOwner').value = item.owner;
  document.getElementById('vPhone').value = item.phone;
  document.getElementById('vPlate').value = item.plateNo;
  document.getElementById('vBrand').value = item.brand;
  document.getElementById('vStart').value = item.startDate;
  document.getElementById('vEnd').value = item.endDate;
  document.getElementById('vAmount').value = item.amount;
  document.getElementById('vPayType').value = item.payType;
  openMask('vMask');
}
//=============================================================编辑月卡
function openE(id) {
  var item = list.find(function(i) { return i.id === id; });
  if (!item) return;
  editMode = 'edit';
  currentEditId = id;
  document.getElementById('eTitle').innerText = '编辑月卡';
  document.getElementById('eOwner').value = item.owner;
  document.getElementById('ePhone').value = item.phone;
  document.getElementById('ePlate').value = item.plateNo;
  document.getElementById('eBrand').value = item.brand;
  document.getElementById('eStart').value = item.startDate;
  document.getElementById('eEnd').value = item.endDate;
  document.getElementById('eAmount').value = item.amount;
  document.getElementById('ePayType').value = item.payType;
  openMask('eMask');
}
//=============================================================续费月卡
function openR(id) {
  var item = list.find(function(i) { return i.id === id; });
  if (!item) return;
  editMode = 'renew';
  currentEditId = id;
  document.getElementById('eTitle').innerText = '续费';
  document.getElementById('eOwner').value = item.owner;
  document.getElementById('eOwner').readOnly = true;
  document.getElementById('ePhone').value = item.phone;
  document.getElementById('ePhone').readOnly = true;
  document.getElementById('ePlate').value = item.plateNo;
  document.getElementById('ePlate').readOnly = true;
  document.getElementById('eBrand').value = item.brand;
  document.getElementById('eBrand').readOnly = true;
  document.getElementById('eStart').value = item.startDate;
  document.getElementById('eEnd').value = item.endDate;
  document.getElementById('eAmount').value = item.amount;
  document.getElementById('ePayType').value = item.payType;
  openMask('eMask');
}
//=============================================================保存月卡
function saveE() {
  var idx = list.findIndex(function(i) { return i.id === currentEditId; });
  if (idx === -1) return;

  list[idx].owner = document.getElementById('eOwner').value;
  list[idx].phone = document.getElementById('ePhone').value;
  list[idx].plateNo = document.getElementById('ePlate').value;
  list[idx].brand = document.getElementById('eBrand').value;
  list[idx].startDate = document.getElementById('eStart').value;
  list[idx].endDate = document.getElementById('eEnd').value;
  list[idx].amount = document.getElementById('eAmount').value;
  list[idx].payType = document.getElementById('ePayType').value;

  var now = new Date(); now.setHours(0,0,0,0);
  var e = new Date(list[idx].endDate); e.setHours(0,0,0,0);
  list[idx].status = e >= now ? 0 : 1;

  if (editMode === 'renew') {
    document.getElementById('eOwner').readOnly = false;
    document.getElementById('ePhone').readOnly = false;
    document.getElementById('ePlate').readOnly = false;
    document.getElementById('eBrand').readOnly = false;
  }

  saveData();
  closeMask('eMask');
  filteredList = filteredList.filter(function(i) { return i.id !== currentEditId; });
  onSearch();
}
//=============================================================删除月卡
function onDel(id) {
  if (!confirm('确认删除该条数据？')) return;
  list = list.filter(function(i) { return i.id !== id; });
  filteredList = filteredList.filter(function(i) { return i.id !== id; });
  saveData();
  renderTable();
}
//=============================================================批量删除月卡
function onBatchDelete() {
  var cbs = document.querySelectorAll('.rowC:checked');
  if (cbs.length === 0) { alert('请先勾选要删除的记录'); return; }
  if (!confirm('确认删除选中的 ' + cbs.length + ' 条数据？')) return;

  var ids = [];
  cbs.forEach(function(c) { ids.push(Number(c.value)); });

  list = list.filter(function(i) { return ids.indexOf(i.id) === -1; });
  saveData();
  onSearch();
}
//=============================================================页面加载时执行
window.onload = function() {
  list = loadData();
  filteredList = list.slice();// 初始时"筛选后列表 = 完整列表"
  renderTable();
};

/*
浏览器打开 monthCard.html
  ↓
window.onload
  ↓
  loadData() → filteredList = list.slice() → renderTable()
  ↓
表格显示出来了，接下来全靠用户点击触发
  ↓
用户能做的所有操作

 点查询  → onSearch()   → filteredList 变 → renderTable()
 点重置  → onReset()    → filteredList 还原 → renderTable()
  点上一页→ goPage(n)    → currentPage 改  → renderTable()
  点切换条数 → changeSize()               → renderTable()
  点全选  → toggleAll(cb)  → 改复选框状态
  点查看  → openV(id)     → 填 vMask 弹窗 → openMask()
  点编辑  → openE(id)     → 填 eMask 弹窗 → openMask()
  点续费  → openR(id)     → 填 eMask 弹窗 + 设 readonly → openMask()
  弹窗点确定 → saveE()    → 写回 list → saveData() → closeMask() → onSearch()
  点删除  → onDel(id)     → list.filter 剔除 → saveData() → renderTable()
  点批量删 → onBatchDelete() → 收集 ids → list.filter 批量剔除 → saveData() → onSearch()
*/
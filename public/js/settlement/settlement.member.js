(function (exports) {

	'use strict';

	var Settlement = function () {
		var _instance = null,
			_this = this;

		Settlement = function () {
			return _instance;
		}

		Settlement.prototype = this;
		_instance = new Settlement();
		_instance.constructor = Settlement();

		var isAdmin = params.user['인덱스'] === 4 || (params.user['설정'].admin && params.user['설정'].admin == 1);

		var commission = {
			'판매수당': 10,
			'신규영업': 10
		};
		/**
		 * 1.달력
		 * 2. OPTIONS
		 * 3. AXIOS
		 * 4. API
		 * 4.1 연유지, 유지보수외 분리
		 * 4.5 합계(수당지급)
		 * 5. RENDER
		 * 6. 신규판매현황
		 * 7. 프린트
		 * 8. 메모기능
		 */

		_this.el = {
			$MONTHPICKER: $('.datepicker'),
			$MANAGER: $('.managers'),
			$TABLES: $('.settlement-table'),
			$PAYMENT: $('#payment_table'),
			$YAERMAIN: $('#year_maintaince'),
			$NEWSALE: $('#new_sales'),
			$SALE: $('#sales'),
			$SALEDETAIL: $('#sales_details'),
			$ADDROW: $('#add-row'),
			$EXCEL: $('#export'),
			$CLOSED: $('#closed')
		};

		_this.options = sessionStorage.getItem('settlement_memberOption') ? JSON.parse(sessionStorage.getItem('settlement_memberOption')) : {
			date: {
				start: moment().startOf('month').format('YYYY-MM-DD'),
				end: moment().endOf('month').format('YYYY-MM-DD'),
				misu: moment().format('YYYY-MM-DD') //moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
			},
			member: 0
		};

		_this.sort = {
			year_maintaince: {
				field: '기관명칭',
				order: 'asc'
			},
			sales: {
				field: '기관명칭',
				order: 'asc'
			},
			sales_details: {
				field: '기관명칭',
				order: 'asc'
			}
		};

		_this.rows = {
			cms: function (item, index) {

				item['지급액'] = (function () {
					if ((_this.options.member == 58 || _this.options.member == 185) && item['프로그램'].toLowerCase() === 'echart') {
						return item['유지보수입금'] * item['관리수당'] / 100 / 2;
					} else {
						return item['유지보수입금'] * item['관리수당'] / 100;
					}
				})();



				var $ROW = '';
				$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
				$ROW += '	<td>' + (index + 1) + '</td>';
				$ROW += '	<td>' + item['기관명칭'] + '</td>';
				$ROW += '	<td>' + item['프로그램'] + '</td>';


				if (isAdmin) {
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수총액" value="' + item['유지보수총액'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="월입금" value="' + item['월입금'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수입금" value="' + item['유지보수입금'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수외" value="' + item['유지보수외'] + '"/></td>';
				} else {
					$ROW += '	<td class="text-right">' + (item['유지보수총액'] > 0 ? item['유지보수총액'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['월입금'] > 0 ? item['월입금'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['유지보수입금'] > 0 ? item['유지보수입금'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['유지보수외'] > 0 ? item['유지보수외'].toLocaleString() : '-') + '</td>';
				}

				$ROW += '	<td class="text-right red">' + (item['관리수당'] > 0 ? item['관리수당'] + '%' : '-') + '</td>';
				$ROW += '	<td class="text-right red">' + (item['지급액'] > 0 ? item['지급액'].toLocaleString() : '-') + '</td>';
				$ROW += '	<td class="text-right red">' + (item['미수금'] > 0 ? item['미수금'].toLocaleString() : '-') + '</td>';

				if (isAdmin) {
					$ROW += '	<td><input type="text" class="form-control input input-sm memo" value="' + item['메모'] + '"/></td>';
					$ROW += '	<td><button type="button" data-hosp="' + item['ID'] + '" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button></td>';
				} else {
					$ROW += '	<td>' + item['메모'] + '</td>';
					$ROW += '	<td></td>';
				}

				$ROW += '</tr>';
				return $ROW
			},
			cmsTotal: function (data, header) {
				var $ROW = '';
				var total = (function () {
					var _total = {
						유지보수총액: 0,
						월입금: 0,
						유지보수입금: 0,
						유지보수외: 0,
						지급액: 0,
						미수금: 0
					};
					data.forEach(function (item) {
						_total['유지보수총액'] += item['유지보수총액'];
						_total['월입금'] += item['월입금'];
						_total['유지보수입금'] += item['유지보수입금'];
						_total['유지보수외'] += item['유지보수외'];
						_total['지급액'] += item['지급액'];
						_total['미수금'] += item['미수금'];
					});
					return _total;
				})();
				$ROW += '<tr class="settlement-total">';
				$ROW += '    <td></td>';
				$ROW += '    <td>' + header + '</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="text-right">' + (total['유지보수총액'] > 0 ? total['유지보수총액'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (total['월입금'] > 0 ? total['월입금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (total['유지보수입금'] > 0 ? total['유지보수입금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (total['유지보수외'] > 0 ? total['유지보수외'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="text-right">' + (total['지급액'] > 0 ? total['지급액'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="red text-right">' + (total['미수금'] > 0 ? total['미수금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td colspan="2"></td>';
				$ROW += '</tr>';
				return $ROW;
			},
			yearCms: function (item, index) {

				item['지급액'] = item['지급액'] || (function () {
					// if ((_this.options.member == 58 || _this.options.member == 185) && item['프로그램'].toLowerCase() === 'echart') {
					// 	return item['유지보수입금'] * item['관리수당'] / 100 / 2;
					// } else {
					return item['유지보수입금'] * item['관리수당'] / 100;
					// }
				})();

				var $ROW = '';
				$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
				$ROW += '    <td>' + (index + 1) + '</td>';
				$ROW += '    <td>' + item['기관명칭'] + '</td>';
				$ROW += '    <td>' + item['프로그램'] + '</td>';
				// $ROW += '    <td class="text-right">' + (item['유지보수총액'] > 0 ? item['유지보수총액'].toLocaleString() : '-') + '</td>';
				// $ROW += '    <td class="text-right">' + (item['월입금'] > 0 ? item['월입금'].toLocaleString() : '-') + '</td>';
				// $ROW += '    <td class="text-right">' + (item['유지보수입금'] > 0 ? item['유지보수입금'].toLocaleString() : '-') + '</td>';
				// $ROW += '    <td class="text-right">' + (item['유지보수외'] > 0 ? item['유지보수외'].toLocaleString() : '-') + '</td>';

				if (isAdmin) {
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수총액" value="' + item['유지보수총액'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="월입금" value="' + item['월입금'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수입금" value="' + item['유지보수입금'] + '"/></td>';
					$ROW += '	<td><input type="number" class="form-control input input-sm text-right" data-key="유지보수외" value="' + item['유지보수외'] + '"/></td>';
				} else {
					$ROW += '	<td class="text-right">' + (item['유지보수총액'] > 0 ? item['유지보수총액'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['월입금'] > 0 ? item['월입금'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['유지보수입금'] > 0 ? item['유지보수입금'].toLocaleString() : '-') + '</td>';
					$ROW += '	<td class="text-right">' + (item['유지보수외'] > 0 ? item['유지보수외'].toLocaleString() : '-') + '</td>';
				}

				$ROW += '    <td class="text-right">' + (item['관리수당'] > 0 ? item['관리수당'] + '%' : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (item['지급액'] > 0 ? item['지급액'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="red text-right">' + (item['미수금'] > 0 ? item['미수금'].toLocaleString() : '-') + '</td>';

				if (isAdmin) {
					$ROW += '    <td><input type="text" class="form-control input input-sm  memo" value="' + item['메모'] + '"/></td>';
					$ROW += '    <td><button type="button" data-hosp="' + item['ID'] + '" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button></td>';
				} else {
					$ROW += '    <td>' + item['메모'] + '</td>';
					$ROW += ' 	  <td></td>';
				}

				$ROW += '</tr>';
				return $ROW;
			},
			yearCmsTotal: function (data, header) {
				var $ROW = '';
				var total = (function () {
					var _total = {
						월입금: 0,
						유지보수입금: 0,
						유지보수외: 0,
						미수금: 0
					};
					data.forEach(function (item) {
						_total['월입금'] += item['월입금'];
						_total['유지보수입금'] += item['유지보수입금'];
						_total['유지보수외'] += item['유지보수외'];
						_total['지급액'] += item['지급액'];
						_total['미수금'] += item['미수금'];
					});
					return _total;
				})();
				$ROW += '<tr class="settlement-total">';
				$ROW += '    <td></td>';
				$ROW += '    <td>합계</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="text-right">' + (total['월입금'] > 0 ? total['월입금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (total['유지보수입금'] > 0 ? total['유지보수입금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="text-right">' + (total['유지보수외'] > 0 ? total['유지보수외'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="text-right">' + (total['지급액'] > 0 ? total['지급액'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="red text-right">' + (total['미수금'] > 0 ? total['미수금'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td colspan="2"></td>';
				$ROW += '</tr>';
				return $ROW;
			},
			others: function (item, index) {
				var $ROW = '';
				if (isAdmin) {
					$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
					$ROW += '    <td>' + (index + 1) + '</td>';
					$ROW += '    <td>' + item['기관명칭'] + '</td>';
					$ROW += '    <td><input type="text" class="form-control input input-sm" value="' + (item['품목'] || '') + '" /></td>';
					$ROW += '    <td><input type="number" class="form-control input input-sm" value="' + (item['금액'] || '') + '" /></td>';
					$ROW += '    <td class="red sale-price text-right" data-sale-price="' + item['유지보수외'] + '">' + item['유지보수외'].toLocaleString() + '</td>';
					$ROW += '    <td><input type="number" class="form-control input input-sm origin-price" value="' + (item['원가금액'] || '') + '" /></td>';
					$ROW += '    <td class="pure-price text-right">' + (item['순수익'] ? item['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="fee text-right">' + (item['수당'] ? item['수당'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="4">';
					// $ROW += '       <button type="button" data-hosp="' + item['ID'] + '" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button>';
					$ROW += '       <button type="button" data-hosp="' + item['ID'] + '" class="btn btn-success btn-sm m-b-none">저장</button>';
					$ROW += '       <button type="button" data-hosp="' + item['ID'] + '" class="btn btn-default btn-sm m-b-none">유지보수</button>';
					$ROW += '       <button type="button" data-hosp="' + item['ID'] + '" class="btn btn-danger btn-sm m-b-none">삭제</button>';
					$ROW += '    </td>';
					$ROW += '</tr>';
				} else {
					$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
					$ROW += '    <td>' + (index + 1) + '</td>';
					$ROW += '    <td>' + item['기관명칭'] + '</td>';
					$ROW += '    <td>' + (item['품목'] || '') + '</td>';
					$ROW += '    <td class="text-right">' + (item['금액'] ? item['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="red text-right">' + (item['유지보수외'] ? item['유지보수외'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + (item['원가금액'] ? item['원가금액'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + (item['순수익'] ? item['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + (item['수당'] ? item['수당'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="4"></td>';
					$ROW += '</tr>';
				}
				return $ROW;
			},
			othersTotal: function (data, header, commission) {
				var $ROW = '';
				var total = (function () {
					var _total = {
						기관명칭: '',
						품목: '',
						순수익: 0,
						판매수당: 0
					};

					data.forEach(function (item) {
						_total['기관명칭'] = data.length === 1 ? item['기관명칭'] : '';
						_total['품목'] = data.length === 1 && item['품목'] ? item['품목'] : '';
						_total['순수익'] += (item['원가금액'] ? parseInt(item['유지보수외']) - parseInt(item['원가금액']) : 0);
						_total['판매수당'] += (item['원가금액'] ? (parseInt(item['유지보수외']) - parseInt(item['원가금액'])) * parseInt(commission['판매수당']) / 100 : 0);
					});

					_total['판매수당'] = Math.floor(_total['판매수당']);

					return _total;
				})();
				$ROW += '<tr class="settlement-total">';
				$ROW += '    <td></td>';
				$ROW += '    <td>합계</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="pure-price text-right">' + (total['순수익'] > 0 ? total['순수익'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td class="fee text-right">' + (total['판매수당'] > 0 ? total['판매수당'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td colspan="4"></td>';
				$ROW += '</tr>';
				return $ROW;
			},
			newSale: function (item, index, commission) {
				var $ROW = '';
				if (isAdmin) {
					$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
					$ROW += '    <td>' + (index + 1) + '</td>';
					$ROW += '    <td><input type="text" class="form-control input input-sm" value="' + (item['기관명칭'] || '') + '"/></td>';
					$ROW += '    <td><input type="text" class="form-control input input-sm" value="' + (item['품목'] || '') + '" /></td>';
					$ROW += '    <td><input type="number" class="form-control input input-sm" value="' + (item['금액'] || '') + '" /></td>';
					$ROW += '    <td><input type="number" class="form-control input input-sm" value="' + (item['입금액'] || '') + '" /></td>';
					$ROW += '    <td><input type="number" class="form-control input input-sm" value="' + (item['순수익'] || '') + '" /></td>';
					$ROW += '    <td class="text-right">' + commission['신규영업'] + '%</td>';
					$ROW += '    <td class="text-right">' + (item['순수익'] ? (item['순수익'] * parseInt(commission['신규영업']) / 100).toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="4">';
					// $ROW += '       <button type="button" data-hosp="' + item['ID'] + '" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button>';
					$ROW += '       <button type="button" class="btn btn-success btn-sm m-b-none">저장</button>';
					$ROW += '       <button type="button" class="btn btn-danger btn-sm m-b-none">삭제</button>';
					$ROW += '    </td>';
					$ROW += '</tr>';
				} else {
					$ROW += '<tr data-hosp="' + item['ID'] + '" data-original-index="' + item.originalIndex + '">';
					$ROW += '    <td>' + (index + 1) + '</td>';
					$ROW += '    <td>' + (item['기관명칭'] || '') + '</td>';
					$ROW += '    <td>' + (item['품목'] || '') + '</td>';
					$ROW += '    <td>' + (item['금액'] ? item['금액'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td>' + (item['입금액'] ? item['입금액'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td>' + (item['순수익'] ? item['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + commission['신규영업'] + '%</td>';
					$ROW += '    <td class="text-right">' + (item['순수익'] ? (item['순수익'] * parseInt(commission['신규영업']) / 100).toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="4"></td>';
					$ROW += '</tr>';
				}
				return $ROW;
			},
			newSaleTotal: function (data, commission) {
				var $ROW = '';
				var total = (function () {
					var _total = {
						기관명칭: '',
						품목: '',
						순수익: 0,
						영업수당: 0
					};
					data.forEach(function (item) {
						_total['기관명칭'] = data.length === 1 ? item['거래처명'] : '';
						_total['품목'] = data.length === 1 && item['품목'] ? item['품목'] : '';
						_total['순수익'] += item['순수익'];
						_total['영업수당'] += parseInt(item['순수익']) * parseInt(commission['신규영업']) / 100;
					});
					_total['영업수당'] = Math.floor(_total['영업수당']);
					return _total;
				})();
				$ROW += '<tr class="settlement-total">';
				$ROW += '    <td></td>';
				$ROW += '    <td>합계</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="pure-price text-right">' + (total['순수익'] > 0 ? total['순수익'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td></td>';
				$ROW += '    <td class="fee text-right">' + (total['영업수당'] > 0 ? total['영업수당'].toLocaleString() : '-') + '</td>';
				$ROW += '    <td colspan="4"></td>';
				$ROW += '</tr>';
				return $ROW;
			},
			payment: {
				cms: function (data, commission, header) {
					var $ROW = '';
					var total = (function () {
						var _total = {
							유지보수총액: 0,
							월입금: 0,
							유지보수입금: 0,
							유지보수외: 0,
							지급액: 0,
							미수금: 0
						};
						data.forEach(function (item) {
							_total['유지보수총액'] += item['유지보수총액'];
							_total['월입금'] += item['월입금'];
							_total['유지보수입금'] += item['유지보수입금'];
							_total['유지보수외'] += item['유지보수외'];
							_total['지급액'] += item['지급액'];
							_total['미수금'] += item['미수금'];
						});
						return _total;
					})();
					$ROW += '<tr class="cms-total">';
					$ROW += '    <td>' + header + '</td>';
					$ROW += '    <td>' + _this.options.date.end + '</td>';
					$ROW += '    <td>전체거래처</td>';
					$ROW += '    <td>유지보수</td>';
					$ROW += '    <td class="bg-warning text-right">' + (total['유지보수입금'] > 0 ? Math.floor(total['유지보수입금'] / 1.1).toLocaleString() : '-') + '</td>';

					$ROW += '    <td></td>';
					// if (_this.options.member == 58 || _this.options.member == 185) {
					// $ROW += '    <td class="text-right">' + commission['관리수당'] + '% * 50%</td>';
					$ROW += '    <td class="fee text-right" data-fee="' + Math.floor(total['지급액'] / 1.1) + '">' + (total['지급액'] > 0 ? Math.floor(total['지급액'] / 1.1).toLocaleString() : '-') + '</td>';
					// } else {
					// $ROW += '    <td class="text-right">' + commission['관리수당'] + '%</td>';
					// $ROW += '    <td class="fee text-right" data-fee="' + Math.floor((total['유지보수입금'] / 1.1) * parseInt(commission['관리수당']) / 100) + '">' + (total['유지보수입금'] > 0 ? Math.floor((total['유지보수입금'] / 1.1) * parseInt(commission['관리수당']) / 100).toLocaleString() : '-') + '</td>';
					// }
					$ROW += '    <td colspan="3"><i class="fa fa-caret-left"></i> 지급액의 총액 / 1.1(부가세) </td>';
					$ROW += '</tr>';
					return $ROW;
				},
				yearCms: function (data, commission) {
					var $ROW = '';
					var total = (function () {
						var _total = {
							월입금: 0,
							유지보수입금: 0,
							유지보수외: 0,
							지급액: 0,
							미수금: 0
						};
						data.forEach(function (item) {
							_total['월입금'] += item['월입금'];
							_total['유지보수입금'] += item['유지보수입금'];
							_total['유지보수외'] += item['유지보수외'];
							_total['지급액'] += item['지급액'];
							_total['미수금'] += item['미수금'];
						});
						return _total;
					})();
					$ROW += '<tr class="year-total">';
					$ROW += '    <td>관리수당(연유지)</td>';
					$ROW += '    <td></td>';
					$ROW += '    <td></td>';
					$ROW += '    <td>연유지보수</td>';
					$ROW += '    <td class="bg-warning text-right">' + (total['유지보수입금'] > 0 ? Math.floor(total['유지보수입금'] / 1.1).toLocaleString() : '-') + '</td>';

					// $ROW += '    <td class="text-right">' + commission['관리수당_연유지'] + ' %</td > ';
					// $ROW += '    <td class="fee text-right" data-fee="' + Math.floor((total['유지보수입금'] / 1.1) * parseInt(commission['관리수당_연유지']) / 100) + '">' + (total['유지보수입금'] > 0 ? Math.floor((total['유지보수입금'] / 1.1) * parseInt(commission['관리수당_연유지']) / 100).toLocaleString() : '-') + '</td>';
					$ROW += '    <td></td>';
					$ROW += '    <td class="fee text-right" data-fee="' + Math.floor(total['지급액'] / 1.1) + '">' + (total['지급액'] > 0 ? Math.floor(total['지급액'] / 1.1).toLocaleString() : '-') + '</td>';

					$ROW += '    <td colspan="5"><i class="fa fa-caret-left"></i> 유지보수총액 / 1.1(부가세) </td>';
					$ROW += '</tr>';
					return $ROW;
				},
				others: function (data, commission) {
					var $ROW = '';
					var total = (function () {
						var _total = {
							기관명칭: '',
							품목: '',
							순수익: 0,
							판매수당: 0
						};

						data.forEach(function (item) {
							_total['기관명칭'] = data.length === 1 ? item['기관명칭'] : '';
							_total['품목'] = data.length === 1 && item['품목'] ? item['품목'] : '';
							_total['순수익'] += (item['원가금액'] ? parseInt(item['유지보수외']) - parseInt(item['원가금액']) : 0);
							_total['판매수당'] += (item['원가금액'] ? (parseInt(item['유지보수외']) - parseInt(item['원가금액'])) * parseInt(commission['판매수당']) / 100 : 0);
						});
						_total['판매수당'] = Math.floor(_total['판매수당']);
						return _total;
					})();
					$ROW += '<tr class="sales-total">';
					$ROW += '    <td>유지보수 외</td>';
					$ROW += '    <td>' + _this.options.date.end + '</td>';
					$ROW += '    <td>' + total['기관명칭'] + '</td>';
					$ROW += '    <td>' + total['품목'] + '</td>';
					$ROW += '    <td class="pure-price bg-warning text-right">' + (total['순수익'] > 0 ? total['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + commission['판매수당'] + ' %</td > ';
					$ROW += '    <td class="fee text-right" data-fee="' + total['판매수당'] + '">' + (total['판매수당'] > 0 ? total['판매수당'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="5"><i class="fa fa-caret-left"></i> (유지보수 외(총액) - 원가금액(총액)) * ' + commission['판매수당'] + '%</td>';
					$ROW += '</tr>';
					return $ROW;
				},
				newSale: function (data, commission) {
					var $ROW = '';
					var total = (function () {
						var _total = {
							기관명칭: '',
							품목: '',
							순수익: 0,
							영업수당: 0
						};
						data.forEach(function (item) {
							_total['기관명칭'] = data.length === 1 ? item['기관명칭'] : '';
							_total['품목'] = data.length === 1 && item['품목'] ? item['품목'] : '';
							_total['순수익'] += item['순수익'];
							_total['영업수당'] += parseInt(item['순수익']) * parseInt(commission['신규영업']) / 100;
						});
						_total['영업수당'] = Math.floor(_total['영업수당']);
						return _total;
					})();
					$ROW += '<tr class="newsales-total">';
					$ROW += '    <td>신규영업</td>';
					$ROW += '    <td>' + _this.options.date.end + '</td>';
					$ROW += '    <td>' + total['기관명칭'] + '</td>';
					$ROW += '    <td>' + total['품목'] + '</td>';
					$ROW += '    <td class="pure-price bg-warning text-right">' + (total['순수익'] > 0 ? total['순수익'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td class="text-right">' + commission['신규영업'] + ' %</td > ';
					$ROW += '    <td class="fee text-right" data-fee="' + total['영업수당'] + '">' + (total['영업수당'] > 0 ? total['영업수당'].toLocaleString() : '-') + '</td>';
					$ROW += '    <td colspan="5"><i class="fa fa-caret-left"></i> 순수익(총액) * ' + commission['신규영업'] + '%</td>';
					$ROW += '</tr>';
					return $ROW;
				},
				service: function (data) {
					var $ROW = '';
					$ROW += '<tr class="settlement-total service-total">';
					$ROW += '    <td>A/S인계</td>';
					$ROW += '    <td>' + _this.options.date.end.substr(0, 7) + '</td>';
					$ROW += '    <td></td>';
					$ROW += '    <td></td>';
					$ROW += '    <td></td>';
					$ROW += '    <td></td > ';
					$ROW += '    <td class="fee red text-right" data-fee="-' + (data['인계건'] * 500) + '">-' + (data['인계건'] * 500).toLocaleString() + '</td>';
					$ROW += '    <td colspan="5"><i class="fa fa-caret-left"></i> A/S인계건(' + data['인계건'] + '건) * 500 </td>';
					$ROW += '</tr>';
					return $ROW;
				}
			}
		}

		_this.settlement = null;


		function Initialize() {

			if (!isAdmin) {
				_this.el.$ADDROW.hide();
				_this.el.$CLOSED.hide();
			}

			_this.el.$MONTHPICKER.datetimepicker({
				format: 'YYYY년 M월',
				defaultDate: moment().format(),
				showTodayButton: true,
				ignoreReadonly: true,
				keepOpen: true,
				viewMode: 'months'
			}).bind('dp.change', function (event) {
				_this.options.date.start = event.date.startOf('month').format('YYYY-MM-DD');
				_this.options.date.end = event.date.endOf('month').format('YYYY-MM-DD');
				_this.options.date.misu = event.date.format('YYYY-MM-DD');

				if (_this.options.member === 0) {
					new PNotify({
						title: '직원정산',
						text: '담당자를 선택해주세요.',
						type: 'info'
					});
				} else {
					Load();
				}

			});

			_this.el.$MANAGER.bind('changed.bs.select', function (event) {
				_this.options.member = $(this).selectpicker('val');
				Load();
			});


			_this.el.$SALEDETAIL.bind('click', function (event) {
				var $THIS;
				if (event.target.tagName === 'I') {
					$THIS = $(event.target).parent();
				} else if (event.target.tagName === 'BUTTON') {
					$THIS = $(event.target);
				}
				if ($THIS && $THIS.length) {
					var memo = $THIS.closest('tr').find('input.memo').val().trim();
					// if (memo.length) {
						SaveMemo($THIS.data('hosp'), memo);
					// }
				}
			}).bind('keyup', function (event) {
				if (event.target.tagName === 'INPUT' && event.keyCode === 13) {
					var $THIS = $(event.target);
					if ($THIS.attr('type') === 'number') {
						event.stopPropagation();
						var selIndex;
						var $ROW = $THIS.closest('tr');
						var selected = _this.settlement.cms.find(function (item, index) {
							if (parseInt(item.ID) === parseInt($ROW.data('hosp'))) {
								selIndex = index;
								return true;
							}
						});//[$ROW.data('original-index')];

						if (selected) {
							$ROW.find('input[type="number"]').each(function (i, v) {
								selected[$(v).data('key')] = parseInt($(v).val());
							});

							$ROW.before(_this.rows.cms(selected, selIndex));
							$ROW.remove();
							selIndex = -1;
							if (selected['유지보수외'] > 0) {


								var otherSelected = _this.settlement.others.find(function (item, index) {
									selIndex = index;
									return item.ID === selected.ID;
								});

								if (otherSelected) {
									otherSelected['미수금'] = selected['미수금'];
									otherSelected['월입금'] = selected['월입금'];
									otherSelected['유지보수외'] = selected['유지보수외'];
									otherSelected['유지보수입금'] = selected['유지보수입금'];
									otherSelected['유지보수총액'] = selected['유지보수총액'];
									$ROW = _this.el.$SALE.find('tr[data-hosp="' + selected.ID + '"]');
									$ROW.before(_this.rows.others(otherSelected, selIndex));
									$ROW.remove();
								} else {
									_this.settlement.others.push(JSON.parse(JSON.stringify(selected)));
									_this.settlement.others[_this.settlement.others.length - 1].originalIndex = _this.settlement.others.length - 1;
									$ROW = _this.el.$SALE.find('tr.settlement-total');
									$ROW.before(_this.rows.others(_this.settlement.others[_this.settlement.others.length - 1], _this.settlement.others.length - 1));
								}


							}



							SumCms();
						}

					}
				}
			});

			_this.el.$YAERMAIN.bind('click', function (event) {
				var $THIS;
				if (event.target.tagName === 'I') {
					$THIS = $(event.target).parent();
				} else if (event.target.tagName === 'BUTTON') {
					$THIS = $(event.target);
				}
				if ($THIS && $THIS.length) {
					var memo = $THIS.closest('tr').find('input').val().trim();
					if (memo.length) {
						SaveMemo($THIS.data('hosp'), memo);
					}
				}
			}).bind('keyup', function (event) {
				if (event.target.tagName === 'INPUT' && event.keyCode === 13) {
					var $THIS = $(event.target);
					if ($THIS.attr('type') === 'number') {
						event.stopPropagation();
						var selIndex;
						var $ROW = $THIS.closest('tr');
						var selected = _this.settlement.yearCms.find(function (item, index) {
							if (parseInt(item.ID) === parseInt($ROW.data('hosp'))) {
								selIndex = index;
								return true;
							}
						});//[$ROW.data('original-index')];

						if (selected) {
							$ROW.find('input[type="number"]').each(function (i, v) {
								selected[$(v).data('key')] = parseInt($(v).val());
							});

							$ROW.before(_this.rows.yearCms(selected, selIndex));
							$ROW.remove();
							selIndex = -1;

							if (selected['유지보수외'] > 0) {
								var otherSelected = _this.settlement.others.find(function (item, index) {
									selIndex = index;
									return item.ID === selected.ID;
								});

								if (otherSelected) {
									otherSelected['미수금'] = selected['미수금'];
									otherSelected['월입금'] = selected['월입금'];
									otherSelected['유지보수외'] = selected['유지보수외'];
									otherSelected['유지보수입금'] = selected['유지보수입금'];
									otherSelected['유지보수총액'] = selected['유지보수총액'];
									$ROW = _this.el.$SALE.find('tr[data-hosp="' + selected.ID + '"]');
									$ROW.before(_this.rows.others(otherSelected, selIndex));
									$ROW.remove();
								} else {
									_this.settlement.others.push(JSON.parse(JSON.stringify(selected)));
									_this.settlement.others[_this.settlement.others.length - 1].originalIndex = _this.settlement.others.length - 1;
									$ROW = _this.el.$SALE.find('tr.settlement-total');
									$ROW.before(_this.rows.others(_this.settlement.others[_this.settlement.others.length - 1], _this.settlement.others.length - 1));
								}
							}
							SumYearCms();
						}

					}
				}
			});

			_this.el.$SALE.bind('keyup', function (event) {
				var $THIS = $(event.target);
				if ($THIS.hasClass('origin-price') && event.keyCode === 13) {
					var originprice = parseInt($THIS.val().trim());

					if ($.isNumeric(originprice)) {
						// var commission = exports.params.managers.find(function (manager) {
						// 	return manager['USER_ID'] === parseInt(_this.options.member);
						// })['설정'];
						// commission = JSON.parse(commission) || {
						// 	'판매수당': 10,
						// 	'신규영업': 10
						// };
						var $ROW = $THIS.closest('tr');
						var $PUREPRICE = $ROW.find('.pure-price');
						var $FEE = $ROW.find('.fee');
						var saleprice = parseInt($ROW.find('.sale-price').data('sale-price'));
						var fee = Math.floor((saleprice - originprice) * parseInt(commission['판매수당']) / 100);
						$PUREPRICE.text((saleprice - originprice).toLocaleString()).data('pure-price', saleprice - originprice);
						$FEE.text(fee).data('fee', fee);
						SumSales();

					}
				}
			}).bind('click', function (event) {
				var $THIS;
				if (event.target.tagName === 'I') {
					$THIS = $(event.target).parent();
				} else if (event.target.tagName === 'BUTTON') {
					$THIS = $(event.target);
				}
				if ($THIS && $THIS.length) {
					var selected;
					var hospid = $THIS.data('hosp');
					var $ROW = $THIS.closest('tr');

					if ($THIS.hasClass('btn-default')) {

						selected = _this.settlement.cms.find(function (item) {
							return item.ID === parseInt(hospid);
						});

						selected['유지보수입금'] += selected['유지보수외'];
						selected['유지보수외'] = 0;

						var saleIndex = _this.settlement.others.findIndex(function (item) {
							return item.ID === parseInt(hospid);
						});

						if (saleIndex > -1) {
							_this.settlement.others.splice(saleIndex, 1);
						}

						$ROW.remove();
						// SumSales();
						// Clear();
						// RenderNotClosed();

					} else if ($THIS.hasClass('btn-danger')) {


						// if ($ROW.data('original-index')) {
						// 	_this.settlement.others.splice($ROW.data('original-index'), 1);
						// }

						var selIndex;
						_this.settlement.others.some(function (item, index) {
							if (parseInt(item.ID) === parseInt($ROW.data('hosp'))) {
								selIndex = index;
								return true;
							}
						});
						_this.settlement.others.splice(selIndex, 1);

						$ROW.remove();
						// Clear();
						// RenderNotClosed();
					} else if ($THIS.hasClass('btn-success')) {
						var $INPUTS = $ROW.find('input');

						selected = _this.settlement.others.find(function (item) {
							return parseInt(item.ID) === parseInt($ROW.data('hosp'));
						});//[$ROW.data('original-index')];

						if (selected) {

							selected['품목'] = $INPUTS.eq(0).val().trim();
							selected['금액'] = $INPUTS.eq(1).val().trim();
							selected['원가금액'] = $INPUTS.eq(2).val().trim();
							selected['순수익'] = $ROW.find('td.pure-price').data('pure-price');
							selected['수당'] = $ROW.find('td.fee').data('fee');

							new PNotify({
								title: '직원정산',
								text: '저장되었습니다.',
								type: 'success'
							});

						}



					}

					SumSales();
				}
			});

			_this.el.$ADDROW.bind('click', function (event) {

				if (_this.options.member === 0) {
					new PNotify({
						title: '직원정산',
						text: '담당자를 먼저 선택해주세요.',
						type: 'info'
					});
					return event.preventDefault();
				} else {
					// var commission = exports.params.managers.find(function (manager) {
					// 	return manager['USER_ID'] === parseInt(_this.options.member);
					// })['설정'];
					// commission = JSON.parse(commission) || {
					// 	'판매수당': 10,
					// 	'신규영업': 10
					// };
					_this.el.$NEWSALE.append(
						'<tr>' +
						'    <td>' + (_this.el.$NEWSALE.find('tr').length) + '</td>' +
						'    <td><input type="text" class="form-control input input-sm"/></td>' +
						'    <td><input type="text" class="form-control input input-sm"/></td>' +
						'    <td><input type="number" class="form-control input input-sm"/></td>' +
						'    <td><input type="number" class="form-control input input-sm"/></td>' +
						'    <td><input type="number" class="form-control input input-sm pure-price"/></td>' +
						'    <td class="text-right">' + commission['신규영업'] + '%</td>' +
						'    <td class="fee text-right"></td>' +
						'    <td colspan="2">' +
						'       <button type="button" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button>' +
						'       <button type="button" class="btn btn-danger btn-sm m-b-none"><i class="fa fa-trash"></i></button>' +
						'    </td>' +
						'</tr>'
					);
					_this.el.$NEWSALE.find('.settlement-total').appendTo(_this.el.$NEWSALE);
				}
			});

			_this.el.$NEWSALE.bind('keyup', function (event) {
				var $THIS = $(event.target);
				if ($THIS.hasClass('pure-price') && event.keyCode === 13) {
					var pureprice = parseInt($THIS.val().trim());

					if ($.isNumeric(pureprice)) {
						// var commission = exports.params.managers.find(function (manager) {
						// 	return manager['USER_ID'] === parseInt(_this.options.member);
						// })['설정'];
						// commission = JSON.parse(commission) || {
						// 	'판매수당': 10,
						// 	'신규영업': 10
						// };
						var $ROW = $THIS.closest('tr');
						var $FEE = $ROW.find('.fee');
						var fee = Math.floor(pureprice * parseInt(commission['신규영업']) / 100);
						$FEE.text(fee).data('fee', fee);
						SumNewSales();
					}
				}
			}).bind('click', function (event) {
				var $THIS;
				if (event.target.tagName === 'I') {
					$THIS = $(event.target).parent();
				} else if (event.target.tagName === 'BUTTON') {
					$THIS = $(event.target);
				}
				if ($THIS && $THIS.length) {
					var $ROW = $THIS.closest('tr');
					var index = $ROW.data('original-index');
					var data = {
						기관명칭: '',
						품목: '',
						금액: 0,
						입금액: 0,
						순수익: 0,
						수당: 0
					};
					if ($THIS.hasClass('btn-success')) {
						var $INPUTS = $ROW.find('input');

						if (index) {

							_this.settlement.newSale[index] = {
								기관명칭: $INPUTS.eq(0).val().trim(),
								품목: $INPUTS.eq(1).val().trim(),
								금액: $INPUTS.eq(2).val(),
								입금액: $INPUTS.eq(3).val(),
								순수익: $INPUTS.eq(4).val()
							};

						} else {

							_this.settlement.newSale.push({
								기관명칭: $INPUTS.eq(0).val().trim(),
								품목: $INPUTS.eq(1).val().trim(),
								금액: $INPUTS.eq(2).val(),
								입금액: $INPUTS.eq(3).val(),
								순수익: $INPUTS.eq(4).val()
							});
						}

						new PNotify({
							title: '직원정산',
							text: '저장되었습니다.',
							type: 'success'
						});

					} else if ($THIS.hasClass('btn-danger')) {
						if (index) {
							_this.settlement.newSale.splice(index, 1);
						}
						$ROW.remove();
					}
					SumNewSales();
				}
			});

			_this.el.$EXCEL.bind('click', function (event) {
				event.preventDefault();

				if (_this.options.member === 0) {
					return new PNotify({
						title: '직원정산',
						text: '담당자를 선택해주세요.',
						type: 'info'
					});
				}

				//getting data from our table
				var data_type = 'data:application/vnd.ms-excel';
				var table_div = $('table.settlement').clone();

				table_div.removeClass('table table-hover').attr('border', 1);
				table_div.find('button').remove();
				table_div.find('input').each(function (i, v) {
					$(v).closest('td').text($(v).val().trim());
					$(v).remove();
				});


				var table_html = table_div[0].outerHTML.replace(/ /g, '%20');
				var a = document.createElement('a');
				a.href = data_type + ', ' + table_html;
				a.download = '직원정산_' + exports.params.managers.find(function (manager) {
					return manager['USER_ID'] == _this.options.member;
				})['USER_NAME'] + '_' + _this.options.date.end.substr(0, 7) + '.xls';
				a.click();

			});

			_this.el.$CLOSED.bind('click', function (event) {

				if (_this.options.member === 0) {
					return new PNotify({
						title: '직원정산',
						text: '담당자를 선택해주세요.',
						type: 'info'
					});
				}

				swal({
					title: '마감하시겠습니까?',
					text: '작성하신 내용으로 정산마감합니다.',
					type: 'question',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: '네'
				}).then(function (result) {
					CloseSettlement();
				}).catch(function () {
					console.log('cancel');
				})

			});


			exports.fn.init_manage(_this.el.$MANAGER)
				.then(function () {
					_this.el.$MONTHPICKER.val(moment(_this.options.date.start).format('YYYY년 M월'));
					if (_this.options.member !== 0) {
						_this.el.$MANAGER.selectpicker('val', _this.options.member);
						Load();
					}
				})
				.catch(function (error) {
					fn.errorNotify(error);
				});

		}

		function Load() {
			// isAdmin = params.user['인덱스'] === 4 || (params.user['설정'].admin && params.user['설정'].admin == 1);
			isAdmin = params.user['설정']['정산'] && params.user['설정']['정산'] === 1;
			isAdmin = params.user['설정'].admin && params.user['설정'].admin == 1;

			isAdmin = params.user['인덱스'] == 5 || params.user['인덱스'] == 43 ? false : true;

			sessionStorage.setItem('settlement_memberOption', JSON.stringify(_this.options));
			axios.get(API.SETTLEMENT.MEMBER, {
				params: _this.options
			}).then(function (result) {
				_this.settlement = result.data;
				Clear();
				if (_this.settlement.bill) {

					_this.el.$ADDROW.hide();
					_this.el.$CLOSED.hide();

					isAdmin = false;
					_this.settlement = _this.settlement.bill;
					RenderNotClosed(); //정산마감
				} else {
					if (isAdmin) {
						_this.el.$ADDROW.show();
						_this.el.$CLOSED.show();
					}
					RenderNotClosed(); //정산미마감
					// RenderPayment();
				}
			}).catch(function (error) {
				fn.errorNotify(error);
			});
		}

		function Clear(key) {
			key = key || 'ALL';
			if (key === 'ALL') {
				_this.el.$TABLES.empty();
			} else {
				_this.el.$TABLES.find('#' + key).empty();
			}
			return;
		}

		function RenderClosed() {

		}

		function RenderNotClosed() {
			var $TARGET, $ROW;
			var data;
			// var commission = exports.params.managers.find(function (manager) {
			// 	return manager['USER_ID'] === parseInt(_this.options.member);
			// })['설정'];
			// commission = JSON.parse(commission) || {
			// 	'판매수당': 10,
			// 	'신규영업': 10
			// };
			// CMS 입금내역
			$TARGET = _this.el.$SALEDETAIL;
			$ROW = '';
			data = _this.settlement.cms;
			if (_this.options.member == 58 || _this.options.member == 185) {
				data = {
					echart: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() === 'echart'; }),
					others: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() !== 'echart'; })
				}
				data.echart.forEach(function (item, index) {
					$ROW += _this.rows.cms(item, index);
				});
				$ROW += _this.rows.cmsTotal(data.echart, 'EChart 합계');

				data.others.forEach(function (item, index) {
					$ROW += _this.rows.cms(item, index);
				});
				$ROW += _this.rows.cmsTotal(data.others, '그외 합계');
			} else {
				data.forEach(function (item, index) {
					item.originalIndex = index;
					$ROW += _this.rows.cms(item, index);
				});
				$ROW += _this.rows.cmsTotal(data, '합계');
			}
			$TARGET.append($ROW);

			// 연유지 거래처
			$TARGET = _this.el.$YAERMAIN;
			$ROW = '';
			data = _this.settlement.yearCms;
			data.forEach(function (item, index) {
				item.originalIndex = index;
				$ROW += _this.rows.yearCms(item, index);
			});
			$ROW += _this.rows.yearCmsTotal(data, '합계');
			$TARGET.append($ROW);

			// 신규영업
			$TARGET = _this.el.$NEWSALE;
			$ROW = '';
			data = _this.settlement.newSale;
			data.forEach(function (item, index) {
				item.originalIndex = index;
				$ROW += _this.rows.newSale(item, index, commission);
			});
			$ROW += _this.rows.newSaleTotal(data, commission);
			$TARGET.append($ROW);

			// 유지보수외 입금액
			$TARGET = _this.el.$SALE;
			$ROW = '';
			data = _this.settlement.others;
			data.forEach(function (item, index) {
				item.originalIndex = index;
				$ROW += _this.rows.others(item, index);
			});
			$ROW += _this.rows.othersTotal(data, '합계', commission);
			$TARGET.append($ROW);

			$('input[type="number"]').bind('wheel', function (event) {
				// event.stopPropagation();
				event.preventDefault();
			});

			return RenderPayment();
		}

		function RenderPayment() {
			var $TARGET, $ROW;
			var data;
			// var commission = exports.params.managers.find(function (manager) {
			// 	return manager['USER_ID'] === parseInt(_this.options.member);
			// })['설정'];
			// // commission = JSON.parse(commission);
			// commission = JSON.parse(commission) || {
			// 	'판매수당': 10,
			// 	'신규영업': 10
			// };

			$TARGET = _this.el.$PAYMENT;
			$TARGET.empty();
			//입급내역
			data = _this.settlement.cms;
			if (_this.options.member == 58 || _this.options.member == 185) {
				data = {
					echart: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() === 'echart'; }),
					others: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() !== 'echart'; })
				};
				$ROW += _this.rows.payment.cms(data.echart, commission, '관리수당(EChart)');
				$ROW += _this.rows.payment.cms(data.others, commission, '관리수당(그외)');
			} else {
				$ROW += _this.rows.payment.cms(data, commission, '관리수당');
			}

			$ROW += _this.rows.payment.yearCms(_this.settlement.yearCms, commission);
			$ROW += _this.rows.payment.newSale(_this.settlement.newSale, commission);
			$ROW += _this.rows.payment.others(_this.settlement.others, commission);
			$ROW += _this.rows.payment.service(_this.settlement.serviceCount[0]);
			$TARGET.append($ROW);

			var total = 0;
			$TARGET.find('.fee').each(function (i, v) {
				total += parseInt($(v).data('fee'));
			});
			$TARGET.append(
				'<tr class="settlement-total payment-total">' +
				'    <td>합계</td>' +
				'    <td></td>' +
				'    <td></td>' +
				'    <td></td>' +
				'    <td></td>' +
				'    <td></td > ' +
				'    <td class="fee red text-right">' + total.toLocaleString() + '</td>' +
				'    <td colspan="5"></td>' +
				'</tr>'
			);


			return;
		}

		function SaveMemo(id, memo) {
			axios.post(API.SETTLEMENT.MEMO, {
				id: id,
				memo: memo
			}).then(function () {
				new PNotify({
					title: '직원정산',
					text: '저장되었습니다.',
					type: 'success'
				});
			}).catch(function (error) {
				fn.errorNotify(error);
			});
		}

		function SaveCurrency(key, id, currencys) {
			var hold = parseInt(currencys[0].val());
			var extra = parseInt(currencys[1].val());
			var selected = _this.settlement[key];
			selected = selected.find(function (item) {
				return item.ID === id;
			});

			if (selected) {
				if (selected['월입금'] !== (hold + extra)) {
					selected['유지보수입금'] = hold;
					selected['유지보수외'] = extra;

					var data = {
						member: _this.options.member,
						date: _this.options.date.end.substr(0, 7),
						type: null, // 판매현황 1 ; 신규 0 ; 판매현황 -> 유지보수입금 2 ; 삭제 3 ;
						id: id,
						name: '',
						product: '',
						price: 0,
						originprice: 0
						// saleprice: ''
					};

				}
			}
		}

		function SaveSaleProduct(data) {
			axios.post(API.SETTLEMENT.SALEPRODUCT, data)
				.then(function () {
					new PNotify({
						title: '직원정산',
						text: '저장되었습니다.',
						type: 'success'
					});
				})
				.catch(function (error) {
					fn.errorNotify(error);
				});
		}

		function SaveNewSale(data) {

			if (data.name.trim() === '') {
				new PNotify({
					title: '직원정산',
					text: '거래처명을 입력해주세요.',
					type: 'info'
				});
				return false;
			}

			axios.post(API.SETTLEMENT.NEWSALE, data)
				.then(function () {
					new PNotify({
						title: '직원정산',
						text: '저장되었습니다.',
						type: 'success'
					});
				})
				.catch(function (error) {
					fn.errorNotify(error);
				});
		}

		function DeleteNewSale(data) {
			return new Promise(function (resolve, reject) {
				axios.delete(API.SETTLEMENT.NEWSALE, {
					data: data
				})
					.then(function () {
						new PNotify({
							title: '직원정산',
							text: '삭제하였습니다.',
							type: 'success'
						});
						resolve();
					})
					.catch(function (error) {
						fn.errorNotify(error);
						reject();
					});
			});
		}

		function SumCms() {
			var $CMSTOTALROW = _this.el.$SALEDETAIL.find('.settlement-total');
			var $PAYMENT_SALESTOTALROW = _this.el.$PAYMENT.find('.cms-total');
			var data = _this.settlement.cms;
			// var commission = exports.params.managers.find(function (manager) {
			// 	return manager['USER_ID'] === parseInt(_this.options.member);
			// })['설정'];
			// commission = JSON.parse(commission) || {
			// 	'판매수당': 10,
			// 	'신규영업': 10
			// };
			if (_this.options.member == 58 || _this.options.member == 185) {
				data = {
					echart: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() === 'echart'; }),
					others: data.filter(function (item, index) { item.originalIndex = index; return item['프로그램'].toLowerCase() !== 'echart'; })
				}
				$CMSTOTALROW.eq(0).before(_this.rows.cmsTotal(data.echart, 'EChart 합계'));
				$CMSTOTALROW.eq(1).before(_this.rows.cmsTotal(data.others, '그외 합계'));
				$PAYMENT_SALESTOTALROW.eq(0).before(_this.rows.payment.cms(data.echart, commission, '관리수당(EChart)'));
				$PAYMENT_SALESTOTALROW.eq(1).before(_this.rows.payment.cms(data.others, commission, '관리수당(그외)'));

			} else {
				$CMSTOTALROW.before(_this.rows.cmsTotal(data, '합계'));
				$PAYMENT_SALESTOTALROW.before(_this.rows.payment.cms(data, commission, '관리수당'));
			}
			$CMSTOTALROW.remove();
			$PAYMENT_SALESTOTALROW.remove();

		}

		function SumYearCms() {
			var $CMSTOTALROW = _this.el.$YAERMAIN.find('.settlement-total');
			var $PAYMENT_SALESTOTALROW = _this.el.$PAYMENT.find('.year-total');
			var data = _this.settlement.yearCms;
			// var commission = exports.params.managers.find(function (manager) {
			// 	return manager['USER_ID'] === parseInt(_this.options.member);
			// })['설정'];
			// commission = JSON.parse(commission) || {
			// 	'판매수당': 10,
			// 	'신규영업': 10
			// };

			$CMSTOTALROW.before(_this.rows.yearCmsTotal(data, '합계'));
			$PAYMENT_SALESTOTALROW.before(_this.rows.payment.yearCms(data));

			$CMSTOTALROW.remove();
			$PAYMENT_SALESTOTALROW.remove();

		}

		function SumNewSales() {
			var $SALESTOTALROW = _this.el.$NEWSALE.find('.settlement-total');
			var $PAYMENT_SALESTOTALROW = _this.el.$PAYMENT.find('.newsales-total');
			var total = 0;
			_this.el.$NEWSALE.find('.pure-price').each(function (i, v) {
				total += $.isNumeric($(v).val()) ? parseInt($(v).val()) : 0;
			});
			$SALESTOTALROW.find('.pure-price').text(total > 0 ? total.toLocaleString() : '-');
			$PAYMENT_SALESTOTALROW.find('.pure-price').text(total > 0 ? total.toLocaleString() : '-');

			total = 0;
			_this.el.$NEWSALE.find('.fee').each(function (i, v) {
				total += ($(v).data('fee') ? parseInt($(v).data('fee')) : 0);
			});
			$SALESTOTALROW.find('.fee').text(total > 0 ? total.toLocaleString() : '-');
			$PAYMENT_SALESTOTALROW.find('.fee').data('fee', total).text(total > 0 ? total.toLocaleString() : '-');
			SumPayment();
		}

		function SumSales() {
			var $SALESTOTALROW = _this.el.$SALE.find('.settlement-total'); //_this.el.$PAYMENT.find('.sales-total');
			var $PAYMENT_SALESTOTALROW = _this.el.$PAYMENT.find('.sales-total');
			var total = 0;
			_this.el.$SALE.find('.pure-price').each(function (i, v) {
				total += ($(v).data('pure-price') ? parseInt($(v).data('pure-price')) : 0);
			});
			$SALESTOTALROW.find('.pure-price').text(total > 0 ? total.toLocaleString() : '-');
			$PAYMENT_SALESTOTALROW.find('.pure-price').text(total > 0 ? total.toLocaleString() : '-');

			total = 0;
			_this.el.$SALE.find('.fee').each(function (i, v) {
				total += ($(v).data('fee') ? parseInt($(v).data('fee')) : 0);
			});
			$SALESTOTALROW.find('.fee').text(total > 0 ? total.toLocaleString() : '-');
			$PAYMENT_SALESTOTALROW.find('.fee').data('fee', total).text(total > 0 ? total.toLocaleString() : '-');
			SumPayment();
		}

		function SumPayment() {
			var $TOTALROW = _this.el.$PAYMENT.find('.payment-total');
			var total = 0;
			_this.el.$PAYMENT.find('.fee').each(function (i, v) {
				total += ($(v).data('fee') ? parseInt($(v).data('fee')) : 0);
			});
			$TOTALROW.find('.fee').text(total.toLocaleString());
		}

		function CloseSettlement() {
			axios.post(API.SETTLEMENT.CLOSE, {
				정산일: _this.options.date.end.substr(0, 7),
				직원ID: _this.options.member,
				정산서: _this.settlement
			})
				.then(function (result) {
					console.log(result);
					return swal({
						title: '저장되었습니다.',
						text: '정산마감이 완료되어 새로고침됩니다.',
						type: 'info'
					})
				})
				.then(function () {
					location.reload();
				})
				.catch(function (error) {
					fn.errorNotify(error);
				});
		}


		_this.fn = {
			Init: Initialize
		};

		return _instance;
	};

	exports.Settlement = new Settlement();
	exports.Settlement.fn.Init();


})(window);

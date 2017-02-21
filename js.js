 $(document).ready(function() {
        var mailData, memberData;
        $.ajax({
            // url: '{% url "company:getpartylist" %}',
            url: 'yunqiparty.json',
            type: 'get',
            async: false,
            success: function(data) {
                // var json = JSON.parse(data)
                mailData = data.party_list.list;
            }
        })

        function getMemberData(curPartyId) {
            $.ajax({
                // url: '{% url "company:get_party_contacts" %}?party_id=' + curPartyId,
                url: 'yunqimember.json',
                type: 'get',
                async: false,
                success: function(res) {
                    // var json = JSON.parse(data)
                    memberData = res.contact_list.list;
                }
            })
        }
        // 面包屑导航
        var queryList = [];
        var crumbsStr = '',
            itemStr = '';
        var sendId = []; // 发送框中的id
        var cacheId = []; // 每次显示选择框时，由sendId初始值
        var partyImgurl = 'https://res.wx.qq.com/mmocbiz/zh_CN/tmt/pc/dist/img/icon-organization-24_714a2dc7.png';
        var imgid = 'img/2.png';
        // 初始化
        function init() {
            // 初始化选择器页面
            $('.js-crumbs').text('全部');

            var directoryData = queryDirectory(0);
            reuseProductItemMethod(directoryData, 'party');   // 生成部门列表
            getMemberData(0)
            if (memberData) {   // 如果存在，生成member列表
                reuseProductItemMethod(memberData, 'member');
            }
            $('.js-item-list').html(itemStr);
            itemStr = '';
            selectItem()
        }
        init();

        // 查询目录结构
        function queryDirectory(curPartyId) {
            var directoryArr = []
            for (var i = 0; i < mailData.length; i++) {
                if (mailData[i].parent_id == curPartyId) {
                    directoryArr.push(mailData[i])
                }
            }
            return directoryArr;
        }

        // 生成item的html复用函数
        function reuseProductItemMethod(acceptData, dataType) {
            for (var i = 0, len = acceptData.length; i < len; i++) {
                itemStr += '<div class="yui_cell js-item-line" data-type="'+ dataType +'" data-id="' + (dataType == 'party' ? acceptData[i].party_id : acceptData[i].worker_id) + '">\
                                <label class="yui_cell_hd js-item-checkbox" for="s' + (dataType == 'party' ? acceptData[i].party_id : acceptData[i].worker_id) + '">\
                                    <input type="checkbox" ' + (acceptData[i].islocked ? 'disabled' : '') + ' class="yui_check" id="s' + (dataType == 'party' ? acceptData[i].party_id : acceptData[i].worker_id) + '">\
                                    <i class="yui_icon_checked iconfont"></i>\
                                </label>'
                                if (dataType == 'party') {
                                    itemStr += '<i class="icon-folder"></i>'
                                } else {
                                    itemStr += '<img class="js-item-img" src="' + imgid + '">'
                                }
                                itemStr +=  '<span class="js-item-name">' + acceptData[i].name + '</span>\
                            </div>'
            }

        }
        // 生成结果item
        function productItem(curPartyId, isChecked) {
            isHasChild(curPartyId); // 判断是否有member成员，有则ajax去拉取member数据

            var directoryData = queryDirectory(curPartyId);
            reuseProductItemMethod(directoryData, 'party');   // 生成部门列表
            if (memberData) {   // 如果存在，生成member列表
                reuseProductItemMethod(memberData, 'member');
            }
            memberData = [];
            if (itemStr == '') {
                $('.js-item-list').html('<div style="margin-top: 20px; margin-left: 40%;font-size:15px;">没有成员</div>');
            } else {
                $('.js-item-list').html(itemStr);
                itemStr = '';
            }
            if (isChecked) {
                $('.js-item-list .yui_check').prop({
                    "checked": true,
                    "disabled": true
                })
            }
            productCrumbs(curPartyId); // 位置必须在最下面
            toTop()
        }

        // 获取面包屑路径数组
        function getQueryList(curPartyId) {
            for (var i = 0; i < mailData.length; i++) {
                if (mailData[i].party_id == curPartyId) {
                    queryList.unshift(mailData[i])
                    if (mailData[i].parent_id != 0) {
                        getQueryList(mailData[i].parent_id)
                    }
                }
            }
        }

        // 生成面包屑结构
        function productCrumbs(curPartyId) {
            queryList = [];
            getQueryList(curPartyId);
            if (curPartyId == 0) {
                crumbsStr += '全部'
            } else {
                crumbsStr += '<a href="javascript:;" class="js_navi_name" data-type="top" data-id="0">全部</a>\
                                    <span class="crumbs-span">&gt;</span>'
                for (var i = 0, len = queryList.length; i < len; i++) {
                    if (i == len - 1) {
                        crumbsStr += queryList[i].name;
                    } else {
                        crumbsStr += '<a href="javascript:;" class="js_navi_name" data-type="party" data-id="' + queryList[i].party_id + '">' + queryList[i].name + '</a>\
                                    <span class="crumbs-span">&gt;</span>'
                    }
                }
            }
            $('.js-crumbs').html(crumbsStr);
            crumbsStr = '';
            selectItem()
            $('.js-crumbs .js_navi_name').each(function() {
                for (var i = 0; i < cacheId.length; i++) {
                    if ($(this).attr('data-id') == cacheId[i]) {
                        $(this).data('checked', true);
                    }
                }
            })
        }

        // 向结果栏添加item
        function addItem(curPartyId, itemName, imgid, dataType, selector) {
            var str = '';
            str += '<li class="input-item" data-id="' + curPartyId + '">\
                            <span class="input-item-icon">\
                                <img style="width:24px;height: 24px;" src="' + (dataType == 'party' ? partyImgurl : imgid) + '">\
                            </span>\
                            <span class="input-item-text">' + itemName + '</span>\
                            <span class="input-delete">\
                                <i class="input-item-close-icon"></i>\
                            </span>\
                        </li>'
            $(selector).append(str);
            // new add
            if (selector == '.accepter-list') {
                pushCacheId(cacheId, curPartyId, dataType);
            }
            tips(selector);
        }

        // 从结果栏删除item
        function delItem(curPartyId, selector) {
            $(selector).find('[data-id=' + curPartyId + ']').remove();
            if (curPartyId == 0) {
                $('.wrapper').removeClass('select_all').children('.js_picker').removeClass('isClick')
            }
            if (selector == '.accepter-res-list') {
                delCacheId(sendId, curPartyId);
            } else if (selector == '.accepter-list') {
                delCacheId(cacheId, curPartyId);
            }
            tips(selector);
        }

        // 通过cacheId选中item
        function selectItem() {
            // console.log(cacheId)
            for (var i = 0, len = cacheId.length; i < len; i++) {
                $('.js-item-list').find('.js-item-line[data-id=' + cacheId[i].slice(1) + ']').find('input').prop('checked', true);
            }
        }

        // 是否显示提示
        function tips(selector) {
            if ($(selector + ' .input-item').size() != 0) {
                $(selector + ' .input-token').hide()
            } else {
                $(selector + ' .input-token').show()
            }
        }

        // 添加缓存id
        function pushCacheId(idArr, curPartyId, dataType) {
            if (dataType == 'party') {
                idArr.push("p" + curPartyId)
            } else {
                idArr.push("m" + curPartyId)
            }
        }
        // 删除缓存id
        function delCacheId(idArr, curPartyId) {
            for (var i = 0, len = idArr.length; i < len; i++) {
                if (idArr[i].slice(1) == curPartyId) {
                    idArr.splice(i, 1);
                    break;
                }
            }
        }

        // 判断是否有member成员
        function isHasChild(curPartyId) {
            var flag = false;
            for (var i = 0, len = mailData.length; i < len; i++) {
                if (mailData[i].party_id == curPartyId) {
                    flag = mailData[i].has_child;
                    break;
                }
            }
            if (flag) {
                getMemberData(curPartyId)
            }
        }

        // 设置input的值
        function setInputVal() {
            var pId = [],
                mId = [];
            for (var i = 0; i < sendId.length; i++) {
                if (sendId[i].slice(0, 1) == 'p') {
                    pId.push(sendId[i].slice(1))
                } else if (sendId[i].slice(0, 1) == 'm') {
                    mId.push(sendId[i].slice(1))
                }
            }
            var d = {
                "party_list": pId,
                "contact_list": mId
            }
            $('#js_input').val(JSON.stringify(d))
            console.log('这是发送的input的值：' + $('#js_input').val())
        }

        //  一层深拷贝
        function deepCopy(copyObj) {
            var targetObj = [];
            for (var i = 0; i < copyObj.length; i++) {
                targetObj[i] = copyObj[i]
            }
            return targetObj;
        }

        //  结果list框返回顶部
        function toTop() {
            $('.js-item-list').scrollTop(0)
        }

        /**************************   点击目录与点击面包屑导航  ********************************************/
        // 点击部门，进入下一级
        $('.js-item-list').on('click', '.js-item-name', function() {
            var curPartyId = $(this).parent().attr('data-id');
            var dataType = $(this).parent().attr('data-type');
            var isChecked = $(this).siblings('label').children('input').prop('checked');
            if (dataType == 'party') {
                productItem(curPartyId, isChecked);
            }

        })

        // 点击面包屑导航
        $('.js-crumbs').on('click', '.js_navi_name', function() {
            var curPartyId = $(this).attr('data-id');
            var isChecked = $(this).data('checked');
            productItem(curPartyId, isChecked);

        })

        /***************************   点击选中与删除  ********************************************/
        // 点击checkbox选中/删除item
        $('.js-item-list').on('click', '.js-item-checkbox', function() {
            var dataType = $(this).parent().attr('data-type');
            var curPartyId = $(this).parent().attr('data-id');
            var itemName = $(this).siblings().text();
            var isChecked = $(this).prop('checked');
            isChecked ? addItem(curPartyId, itemName, imgid, dataType, '.accepter-list') : delItem(curPartyId, '.accepter-list');
        })

        // 选择框中  -- 点击删除item
        $('.accepter-list').on('click', '.input-delete', function() {
            var curPartyId = $(this).parent().attr('data-id');
            delItem(curPartyId, '.accepter-list');
            for (var i = 0; i < queryList.length; i++) {
                console.log(queryList)
                if (queryList[i].party_id == curPartyId) {
                    productItem(queryList.pop().party_id);
                }

            }
            $('.js-item-list').find('.js-item-line[data-id=' + curPartyId + ']').children('input').prop('checked', false);
        })

        // 发送框中  -- 点击删除item
        $('.accepter-res-list').on('click', '.input-delete', function() {
            var curPartyId = $(this).parent().attr('data-id');
            delItem(curPartyId, '.accepter-res-list');
            setInputVal();
        })

        /*****************************  确定与关闭  ********************************************/
        // 确定按钮
        $('.pick-confirm').on('click', function() {
            $('.select-box').toggle();

            $('.accepter-res-list .input-item').remove()
            $('.accepter-res-list').append($('.accepter-list .input-item').clone())

            tips('.accepter-res-list');
            sendId = deepCopy(cacheId); // 将选中的id与sendId合并
            cacheId = [];

            setInputVal();
        })

        // 关闭按钮
        $('.pick-close').on('click', function() {
            $('.select-box').toggle();
        })

        /**************************   点击进行成员选择  ********************************************/
        // 添加成员按钮  + 按钮 显示选择框
        $('.js_picker').on('click', function() {
            if (!$(this).hasClass('isClick')) {
                $('.select-box').toggle();
                cacheId = deepCopy(sendId);
                init()
                $('.accepter-list .input-item').remove()
                $('.accepter-list').append($('.accepter-res-list .input-item').clone())
                tips('.accepter-list');
            }
        })


        /**************************   点击全选  ********************************************/
        // 全选
        $('.js_select_all').on('click', function() {
            $('.accepter-res-list .input-item').remove();
            if ($(this).parent().hasClass('select_all')) { // 可选状态
                $(this).parent().removeClass('select_all');
                $('.js_picker').removeClass('isClick');
                delItem(0, '.accepter-res-list');
                sendId = []
            } else { // 全选状态
                $(this).parent().addClass('select_all');
                $('.js_picker').addClass('isClick');
                addItem(0, '全部成员', null, 'party', '.accepter-res-list')
                sendId = ['p0'];
            }
            setInputVal()
        })
    })
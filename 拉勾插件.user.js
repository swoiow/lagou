// ==UserScript==
// @name                 拉勾插件
// @namespace       http://localhost
// @version              0.3.1
// @description        增强显示
// @description        TODO: 屏蔽公司
// @document          https://tampermonkey.net/documentation.php
// @match                http*://www.lagou.com/zhaopin/*
// @match                http*://www.lagou.com/jobs/list_*
// @match                https://www.lagou.com/jobs/mList.html
// @match                http*://www.lagou.com/*-zhaopin/*
// @run-at                document-end
// @grant                  unsafeWindow
// @grant                  GM_setValue
// @grant                  GM_getValue
// @grant                  GM_addStyle
// ==/UserScript==

window.onload = function() { gLagou.action() };
// var prevajax = jQuery.ajax;
// jQuery.ajax = function() {
//     if (arguments[0].url.match("positionAjax.json")) {
//         prevajax.apply(jQuery, arguments).done(
//             function() {
//                 setTimeout(gLagou.action(), 1000)
//             }
//         )
//     } else {
//         return prevajax.apply(jQuery, arguments);
//     }
// };

var BLACK_LIST = [];
GM_setValue("BLACK_LIST", BLACK_LIST);
// var BLACK_LIST = GM_getValue("BLACK_LIST");

GM_addStyle('.w_j{background-color: #ffe6cc;} .w_d{ background-color: #cceeff;}.w_s{ background-color: #ffffcc;} #feedback{width:120px; height:120px; position:fixed; _position:absolute; left:47%; margin-left:440px; top:270px; _top: expression(documentElement.scrollTop + 204); } .w_feedback{ width:120px; height:120px; z-index: 1000;} .w_feedback a{ display:block; width:19px; margin:0 auto; padding-top:5px} .w_feedback a:hover{ color:#ff7100; text-decoration:none}  .w_suspend a{ display:block;  width: 120px; padding:7px 0 6px 4px; text-decoration:none; font-size:16px;font-weight:bold; color:#878787;} .w_suspend a:hover{ color:#f60; text-decoration:none;}')


var $helper = $('<div class="w_feedback" id="feedback"> <div class="w_suspend"> <a onclick="javascript: gLagou.action()">显示详细信息</a> </div></div>').appendTo(document.body);


var reallyJs = (function myJS() {
    var LagoutHelper = function() {
        this.url = location.href;
        this.is_login = getCookie('login') == "true" && true || false;
        this.disp_search = 1;
        this.disp_my = 2;

        this.w_type = (function(ctx) {
            if (ctx.url.match("lagou.com/zhaopin")) {
                return ctx.disp_search
            } else if (ctx.url.match("lagou.com/jobs/list_")) {
                return ctx.disp_search
            } else if (ctx.url.match("-zhaopin/")) {
                return ctx.disp_search
            } else {
                return ctx.disp_my
            }
        })(this);
    };

    LagoutHelper.prototype.mod = {
        HideDom: function HideDom(d) {
            $(d).css("display", "none");
        },
        Report: function Report(html, type, id) {
            /*  work with to flask */

            var req = $.ajax({});
        },
        ShowLtd: function ShowLtd(id) {
            /*  显示功能*/
            var getData = new Promise(function(resolve, reject) {
                $.ajax({
                    url: "https://www.lagou.com/gongsi/" + id + ".html",
                    // async: false,
                    dataType: "html",
                }).done(function(html) {
                    var $h = $(html);
                    var last_login = $h.find(".company_data li:last-child strong").text();
                    var resume_hd_rate = $h.find(".company_data li:nth-child(2) strong").text().trim();
                    var resume_hd_speed = $h.find(".company_data li:nth-child(3) strong").text().trim();
                    var score = $h.find("div.reviews-top >> span.score").text() || "无";;
                    resolve([last_login, resume_hd_rate + ' / ' + resume_hd_speed, score]);
                });
            })
            return getData;
        },
    };


    LagoutHelper.prototype.core = function() {
        var gO = this;
        var BLACK_LIST = [];

        var $d = $("li.con_list_item").length > 0 && $("li.con_list_item") || $(".rec_pos_item");
        $d.each(function() {
            var ctx = this
            var id = $(ctx).attr("data-companyid") || $(ctx).attr("data-company");

            if (id !== null && BLACK_LIST.indexOf(parseInt(id)) < 0) {
                var res = gO.mod.ShowLtd(id).then(function(res) {
                    var [d, j, s] = res;
                    // j = res[1];
                    // s = res[2];
                    if (d.indexOf("30") === 0) {
                        gO.mod.HideDom(ctx);
                        return false;
                    };

                    var $tag = gO.w_type == gO.disp_search && "span" || "li";
                    var h = "<{tag} class='w_j' title='该公司7日内处理简历数占收取简历数比例'>" + j + " </{tag}>" +
                        "<{tag} class='w_d' title='该公司职位管理者最近一次登录时间'>" + d + " </{tag}>" +
                        "<{tag} class='w_s' title='综合评分'>" + s + " </{tag}>";
                    h = h.replace(/{tag}/g, $tag);
                    var $t = $(ctx);
                    var t = gO.w_type == gO.disp_search && $t.find("div.list_item_bot > div.li_b_l") || $t.find("ul.tags");
                    t.prepend(h);
                });

            } else {
                gO.mod.HideDom(ctx);
            }
        });
    }


    LagoutHelper.prototype.action = function() {
        var match_dom = $("li.con_list_item").length > 0 || $(".rec_pos_item").length > 0;

        if (match_dom) {
            this.core()
        } else {
            $(document).ready(function() {
                setTimeout(gLagou.action(), 4500);
            });
            // alert("工作失败！")
        }
    };


    LagoutHelper.prototype.hotkey = {
        zp: function in_zp() {
            // 按键功能1
            $('body').keydown(function(event) {
                if (event.keyCode == 74 || event.keyCode == 39) {
                    $(".pager_container :last").click();
                } else if (event.keyCode == 75 || event.keyCode == 37) {
                    $(".pager_container :first").click();
                } else {
                    return null;
                }
            });
        },
        job: function in_job() {
            // 按键功能2
            $('body').keydown(function(event) {
                if (event.keyCode == 74 || event.keyCode == 39) {
                    $(".Pagination a:eq(-2)").click();
                } else if (event.keyCode == 75 || event.keyCode == 37) {
                    $(".Pagination a:eq(1)").click();
                } else {
                    return null;
                }
            });
        }
    };

    return new LagoutHelper()

}.toString());

function addGlobalScript(JSCONTENT) {
    var JSLINE, script;
    JSLINE = "//================== [Lagou START] =======================\n";
    JSLINE += 'function getCookie(name) {var value = "; " + document.cookie; var parts = value.split("; " + name + "="); if (parts.length == 2) return parts.pop().split(";").shift(); }\n';

    JSLINE += JSCONTENT;
    JSLINE += "\nvar gLagou = myJS();";
    JSLINE += "\n//================== [Lagou ENDED] =======================";
    script = document.createElement('script');
    script.id = 'JSLINE';
    script.type = 'text/javascript';
    script.innerHTML = JSLINE;
    var scriptTag = document.getElementById('myJS');
    if (scriptTag) document.body.removeChild(scriptTag);
    document.body.appendChild(script);
}

addGlobalScript(reallyJs)

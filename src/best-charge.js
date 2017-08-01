'use strict';
const loadAllItems = require('../src/items.js');
const loadPromotions = require('../src/promotions.js');

function bestCharge(selectedItems) {
  let item_list = build_item_list(selectedItems);
  let price_list = calc_item_price(item_list);
  let price_str = build_print_string(price_list);
  return price_str;
}

function build_item_list(selectedItems){
  let all_items_list = loadAllItems();
  let item_list = [];
  for(let item of all_items_list){
    item.count = 0;
    item.total = 0;
  }
  for(let barcode of selectedItems){
    let item_tmp = barcode.split('x').map(n => n.trim());
    let bar = item_tmp[0];
    let num = item_tmp[1];
    let item = all_items_list.find(function(item){
      if(item.id === bar) return item;
    });
    if(item){
      item.count = Number(num);
      item.total = item.count * item.price;
    }
  }
  for(let item of all_items_list){
    if(item.count > 0){
      item_list.push(item);
    }
  }
  return item_list;
}

function calc_item_price(item_list){
  let promotions = loadPromotions();
  let price_type_1 = calc_item_type(item_list, promotions[0]);
  let price_type_2 = calc_item_type(item_list, promotions[1]);
  return (price_type_1.total <= price_type_2.total)?price_type_1 : price_type_2;
}

function calc_item_type(item_list, promotion){
  let price_list = {};
  price_list.total = 0;
  price_list.cut = 0;
  price_list.type = 0;
  price_list.item_list = item_list;
  price_list.item_list.forEach(function(item){
    price_list.total += item.total;
  });
  
  if(promotion.type === '满30减6元'){
    if(price_list.total >= 30){
      price_list.cut = 6;
      price_list.type = 1;
    }
  }
  if(promotion.type === '指定菜品半价'){
    price_list.item_list.forEach(function(item) {
      if(promotion.items.find(function(bar){if(item.id === bar) return item;})){
        price_list.cut += item.total / 2;
      }
    }, this);
    price_list.type = 2;
  }
  price_list.total -= price_list.cut;
  return price_list;
}

function build_print_string(price_list){
  let price_str = "============= 订餐明细 =============\n";
  for(let item of price_list.item_list){
    price_str += item.name + " x "+item.count+" = "+item.total+"元\n";
  }
  if(price_list.type != 0){
    price_str += "-----------------------------------\n使用优惠:\n";
    price_str += build_promotions_str(price_list.type, price_list.cut);
  }
  price_str += "-----------------------------------\n";
  price_str += "总计："+price_list.total+"元\n";
  price_str += "===================================";
  return price_str;
}

function build_promotions_str(type, cut){
  let promo_str = "";
  let promotions = loadPromotions();
  promo_str += promotions[type-1].type;
  if(type === 2){
    let all_items_list = loadAllItems();
    promo_str += "(";
    let num = 1;
    for(let bar of promotions[1].items){
      let item = all_items_list.find(function(item){
        if(item.id === bar) return item;
      });
      promo_str += item.name;
      if(num === promotions[1].items.length){
         promo_str += ")";
      }else{
        promo_str += "，";
        num++;
      }
    }
  }
  promo_str += "，省"+cut+"元\n";
  return promo_str;
}

module.exports = bestCharge;
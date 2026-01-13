use alloy_contract::Interface;
use alloy_json_abi::JsonAbi;
use alloy_primitives::{Address, U256};
use serde::Serialize;
use serde_wasm_bindgen::to_value;
use std::str::FromStr;
use wasm_bindgen::prelude::{JsValue, wasm_bindgen};

fn weth_interface() -> Interface {
    let weth_abi_json = r#"
    [
      {
        "type": "function",
        "name": "deposit",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "withdraw",
        "inputs": [
          {
            "name": "wad",
            "type": "uint256"
          }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
      }
    ]
    "#;

    let json_abi: JsonAbi = serde_json::from_str(weth_abi_json).unwrap();
    Interface::new(json_abi)
}

#[derive(Serialize)]
pub struct MetaTransaction {
    pub to: Address,
    pub value: U256,
    pub data: Vec<u8>,
}

fn get_native_asset_address(chain_id: u32) -> Address {
    match chain_id {
        1 => "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            .parse()
            .unwrap(),
        _ => panic!("Unsupported chain ID"),
    }
}

#[wasm_bindgen]
pub fn generate_unwrap_transaction(chain_id: u32, amount: &str) -> JsValue {
    let mtx = MetaTransaction {
        to: get_native_asset_address(chain_id),
        value: U256::ZERO,
        data: weth_interface()
            .encode_input("withdraw", &[U256::from_str(amount).unwrap().into()])
            .unwrap(),
    };
    to_value(&mtx).unwrap()
}

#[wasm_bindgen]
pub fn generate_wrap_transaction(chain_id: u32, amount: &str) -> JsValue {
    let mtx = MetaTransaction {
        to: get_native_asset_address(chain_id),
        value: U256::from_str(amount).unwrap(),
        data: weth_interface().encode_input("deposit", &[]).unwrap(),
    };
    to_value(&mtx).unwrap()
}

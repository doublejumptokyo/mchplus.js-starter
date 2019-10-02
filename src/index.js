import Mchplus from 'mchplus.js'
import axios from 'axios'
import config from './config'

let mchplus

async function onClickYourAddress(e) {
  e.preventDefault()
  const address = mchplus.account
  document.querySelector('#your-address').textContent = address
}

async function onClickOwnerOf(e) {
  e.preventDefault()
  const contractAddress = document.ownerOfForm.contractAddress.value
  const tokenId = document.ownerOfForm.tokenId.value
  const contract = mchplus.getContract(contractAddress)
  const owenerAddress = await mchplus.getOwnerAddress(contract, tokenId)
  document.querySelector('#owner-of').textContent = owenerAddress
}

async function onClickTransferFrom(e) {
  e.preventDefault()
  const contractAddress = document.transferFrom.contractAddress.value
  const tokenId = document.transferFrom.tokenId.value
  const destinationAddress = document.transferFrom.destinationAddress.value
  const contract = mchplus.getContract(contractAddress)
  try {
    await mchplus.sendAsset(contract, tokenId, destinationAddress)
    document.querySelector('#transfer-status').textContent = 'Success'
  } catch (e) {
    console.error(e)
    document.querySelector('#transfer-status').textContent = 'Failed'
  }
}

async function onClickMetadata(e) {
  e.preventDefault()
  const contractAddress = document.metadata.contractAddress.value
  const tokenId = document.metadata.tokenId.value
  const name = document.metadata.name.value
  const description = document.metadata.description.value
  const image = document.metadata.image.value
  try {
    await axios.get('http://localhost:8000/api', {
      params: { contractAddress, tokenId, name, description, image, networkId: config.NETWORK_ID }
    })
    document.querySelector('#metadata-post-status').textContent = 'Success'
  } catch (e) {
    console.error(e)
    document.querySelector('#metadata-post-status').textContent = 'Failed'
  }
}

async function init() {
  document.yourAddress.addEventListener('submit', onClickYourAddress)
  document.ownerOfForm.addEventListener('submit', onClickOwnerOf)
  document.transferFrom.addEventListener('submit', onClickTransferFrom)
  document.metadata.addEventListener('submit', onClickMetadata)

  if (window.ethereum) {
    mchplus = new Mchplus(window.ethereum, { dev: true })
  } else if (window.web3) {
    mchplus = new Mchplus(window.web3.currentProvider, { dev: true })
  } else {
    mchplus = new Mchplus(null, { dev: true })
  }
  await mchplus.init()
}

document.addEventListener('DOMContentLoaded', () => init())

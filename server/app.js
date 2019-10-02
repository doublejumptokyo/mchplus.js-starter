var http = require('http')
var os = require('os')
var qs = require('querystring')

const Web3 = require('web3')
const axios = require('axios')
const humps = require('humps')

const PRIVATE_KEY = '0xPRIVATE_KEY'

const web3 = new Web3()
if (!PRIVATE_KEY) {
  throw new Error('There is no Private Key.')
}
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
web3.eth.accounts.wallet.add(account)

async function post(address, data = {}, networkId = 4) {
  const encoded = encodeURIComponent(JSON.stringify(data))
  let metadata
  if (typeof window !== 'undefined') {
    metadata = window.btoa(unescape(encoded))
  } else {
    const btoa = require('btoa')
    metadata = btoa(unescape(encoded))
  }
  const iss = account.address.toLowerCase()
  const sig = account.sign(
    metadata,
    account.privateKey
  ).signature
  const postData = humps.decamelizeKeys({ iss, sig, metadata })
  const url = `https://beta-api.mch.plus/metadata/ethereum/${getNetworkName(networkId)}/${address}`
  const res = await axios.post(url, postData, {
    headers: { 'Content-Type': 'application/json' }
  })
  const isSucceed = res.data === 'ok'
  if (!isSucceed) {
    throw new Error('[Error] An error occurred on post.')
  }
}

function getNetworkName(netId) {
  switch (netId) {
    case '1':
      return 'mainnet'
    case '3':
      return 'ropsten'
    case '4':
      return 'rinkeby'
    default:
      return 'mainnet'
  }
}

http.createServer(function (req, res) {
    if (!req.url.startsWith('/api')) {
        return
    }
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Headers', '*')

    const querystring = req.url.substring(req.url.indexOf('?') + 1)
    const items = qs.parse(querystring)

    if (!items.contractAddress || !items.tokenId) {
      throw new Error('[Error] There is no Contract Address or Token ID.')
    }
    const contractAddress = items.contractAddress
    delete items.contractAddress
    const tokenId = items.tokenId
    delete items.tokenId
    const networkId = items.networkId
    delete items.networkId

    post(`${contractAddress}/${tokenId}`, items, networkId)
      .then(() => {
        res.writeHead(200, {'Content-Type': 'text/plain'})
        const host = os.hostname()
        res.end(`Hello World ${host} \n`)
      })
      .catch(e => {
        console.error(e)
        res.writeHead(404, {'Content-Type': 'text/plain'})
        res.end('Error.')
      })
}).listen(8000)

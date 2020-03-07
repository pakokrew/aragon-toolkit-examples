const { encodeCallScript } = require('@aragon/test-helpers/evmScript')
const { encodeActCall } = require('@aragon/toolkit')

const { ipfsAdd } = require('../../lib/ipfs');

const {
  daoAddress,
  addressBookAddress,
  votingAddress,
  contacts,
  environment,
} = require('./assignations.json')

const getCid = async ({ name, type }) => ipfsAdd({ name, type });

async function main() {
  // Encode a bunch of token mints and burns.
  const addEntrySignature = 'addEntry(address,string)'

  const contactsCallParameters = await Promise.all(
      contacts.map(async contact => [contact.address, await getCid(contact)])
  )

  const calldatum = await Promise.all(
      contactsCallParameters.map(callParameters => encodeActCall(addEntrySignature, callParameters))
  )

  const actions = calldatum.map(calldata => ({
    to: addressBookAddress,
    calldata,
  }))

  // Encode all actions into a single EVM script.
  const script = encodeCallScript(actions)
  console.log(
      `npx dao exec ${daoAddress} ${votingAddress} newVote ${script} AddContacts --environment aragon:${environment} `
  )

  process.exit()
}

main()

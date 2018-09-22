const Joi = require('joi');
const User = require('db/models/User');
const TokenContract = require('db/models/token_contract');
const CrowdsaleContract = require('db/models/crowdsale_contract');


exports.tokenRegist = async (ctx)=> {
  const { user } = ctx.request;


  let {
    publicTokenName,
    tokenSymbol,
    tokenVersion,
    initialSupply,
    decimalUnits,
    contractHash,
    network
  } = ctx.request.body;

  try {
    const tokenContract = new TokenContract({
      name: publicTokenName,
      symbol: tokenSymbol,
      version: tokenVersion,
      initial_supply: initialSupply,
      decimal_points: decimalUnits,
      contract_address: contractHash,
      network: network,
      user_id: user._id,
    });
    
    await tokenContract.save();

    ctx.body = {
      _id: tokenContract._id
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.getTokenList = async (ctx)=> {
  const { user } = ctx.request;
  console.log(user);
  try {
    const tokens = await TokenContract.find({
      user_id: user._id
    }).exec();

    ctx.body = {
      tokens
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.addTeamMember = async (ctx)=> {
  const { user } = ctx.request;

  const { id } = ctx.params;
  const { team_addresses } = ctx.request.body;
  
  if( !team_addresses ){
    ctx.status = 400;
    return;
  }

  try {
    const contract = await TokenContract.findById(id).exec();
        
    if(!contract) {
      ctx.status = 404;
      return;
    }

    await contract.update({ team_addresses }).exec();
    ctx.body = {
      team_addresses : contract.team_addresses
    };
    
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.getTokenContractByAddress = async (ctx)=> {
  const { user } = ctx.request;

  const { address: contract_address } = ctx.params;
  
  try {
    const token = await TokenContract.find({
      contract_address
    }).exec();

    ctx.body = {
      token
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

/*  
** Crowdsale
*/

exports.crowdsaleRegist = async (ctx)=> {
  const { user } = ctx.request;

  const {
    multisigETH,
    tokensForTeam,
    minContributionPreSale,
    minContributionMainSale,
    maxContributionETH,
    maxCap,
    minCap,
    tokenPriceWei,
    campaignDurationDays,
    firstPeriod,
    secondPeriod,
    thirdPeriod,
    firstBonus,
    secondBonus,
    thirdBonus,
    presaleBonus,
    vestingDuration,
    vestingCliff,
    vestingStart,
    crowdsaleAddress,
    network,
    isWhitelistingEnabled,
    isVestingEnabled,
    whitelistAddress,
    tokenAddress
  } = ctx.request.body;

  //print request 
  console.log('[CrowdsaleRegist] recieved');
  console.log(tokenAddress)

  try{
    const tokenContract = await TokenContract.findOne({contract_address : tokenAddress });

    if(!tokenContract){
      ctx.status = 404;
      return;
    }

    const crowdSaleContract = new CrowdsaleContract({
      multisig_eth: multisigETH,
      tokens_for_team: tokensForTeam,
      min_presale: minContributionPreSale,
      min_mainsale: minContributionMainSale,
      max_contrib_eth: maxContributionETH,
      max_cap: maxCap,
      min_cap: minCap,
      token_price_wei: tokenPriceWei,
      campaign_duration_days: campaignDurationDays,
      first_period: firstPeriod,
      second_period: secondPeriod,
      third_period: thirdPeriod,
      first_bonus: firstBonus,
      second_bonus: secondBonus,
      third_bonus: thirdBonus,
      presale_bonus: presaleBonus,
      vesting_duration: vestingDuration,
      vesting_cliff: vestingCliff,
      vesting_start: vestingStart,
      contract_address: crowdsaleAddress,
      network: network,
      user_id: user._id,
      token_contract: tokenContract._id,
      is_whitelisting_enabled: isWhitelistingEnabled,
      is_vesting_enabled: isVestingEnabled,
      whitelist_contract_address: whitelistAddress,
    });

    await crowdSaleContract.save();
    
    ctx.status = 201;
    ctx.body = {
      _id: crowdSaleContract._id
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}


exports.getCrowdsaleList = async (ctx)=> {
  const { user } = ctx.request;
  
  try {
    const contracts = await CrowdsaleContract.find({
      user_id: user._id
    }).populate('token_contract').exec();

    ctx.body = {
      contracts
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.addWhiteList = async (ctx)=> {
  const { user } = ctx.request;

  const { id } = ctx.params;
  const { whitelist_addresses } = ctx.request.body;
  
  console.log(whitelist_addresses);
  if( !whitelist_addresses ){
    ctx.status = 400;
    return;
  }

  try {
    const contract = await CrowdsaleContract.findById(id).exec();
        
    if(!contract) {
      ctx.status = 404;
      return;
    }

    await contract.update({ whitelist_addresses }).exec();
    ctx.body = {
      whitelist_addresses : contract.whitelist_addresses
    };
    
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.getCrowdsaleContractByAddress = async (ctx)=> {
  const { user } = ctx.request;
  const { address: contract_address } = ctx.params;
  
  try {
    const crowdsaleContract = await CrowdsaleContract.findOne({
      contract_address
    }).exec();

    ctx.body = {
      crowdsaleContract
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

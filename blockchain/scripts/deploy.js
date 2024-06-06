const main = async () => {
    const profileImageFactory = await hre.ethers.getContractFactory(
      'SocialMedia',
    )
    const socialMedia = await profileImageFactory.deploy()
  
    await socialMedia.deployed()
  
    console.log('Contract deployed to:', socialMedia.address)
  }
  
  ;(async () => {
    try {
      await main()
      process.exit(0)
    } catch (error) {
      console.error(error)
      process.exit(1)
    }
  })()
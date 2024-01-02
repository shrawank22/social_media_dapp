const TwitterContract = artifacts.require("TwitterContract");

contract("TwitterContract", accounts => {
    let twitter = null;
    const owner = accounts[0];
    const addr1 = accounts[1];

    const NUM_TOTAL_NOT_MY_TWEETS = 5;
    const NUM_TOTAL_MY_TWEETS = 3;

    let totalTweets;
    let totalMyTweets;

    before(async() => {
        twitter = await TwitterContract.deployed();
        totalTweets = [];
        totalMyTweets = [];

        for(let i=0; i<NUM_TOTAL_NOT_MY_TWEETS; i++) {
            let tweet = {
                'tweetText': 'Random text with id: ' + i,
                'username': addr1,
                'isDeleted': false
            };

            await twitter.addTweet(tweet.tweetText, tweet.isDeleted, {from: addr1});
            totalTweets.push(tweet);
        }

        for(let i=0; i<NUM_TOTAL_MY_TWEETS; i++) {
            let tweet = {
                'username': owner,
                'tweetText': 'Random text with id: ' + (NUM_TOTAL_NOT_MY_TWEETS+i),
                'isDeleted': false
            };

            await twitter.addTweet(tweet.tweetText, tweet.isDeleted, {from: owner});
            totalTweets.push(tweet);
            totalMyTweets.push(tweet);
        }
    });

    it("Smart contract should deployed successfully", async() => {
        console.log(twitter.address);
        assert(twitter !== '')
    });

    it("should emit AddTweet event", async function() {
        let tweet = {
          'tweetText': 'New Tweet',
          'isDeleted': false
        };
    
        const result = await twitter.addTweet(tweet.tweetText, tweet.isDeleted, {from: owner});
        const addTweetEvent = result.logs[0];
        
        assert.equal(addTweetEvent.event, "AddTweet");
        assert.equal(addTweetEvent.args.user, owner);
        assert.equal(addTweetEvent.args.totalTweets, NUM_TOTAL_NOT_MY_TWEETS + NUM_TOTAL_MY_TWEETS);
    });

    it("should return the correct number of total tweets", async function() {
        const tweetsFromChain = await twitter.getAllTweets();
        assert.equal(tweetsFromChain.length, NUM_TOTAL_NOT_MY_TWEETS + NUM_TOTAL_MY_TWEETS);
    });

    it("should return the correct number of all my tweets", async function() {
        const myTweetsFromChain = await twitter.getMyTweets({from: owner});
        assert.equal(myTweetsFromChain.length, NUM_TOTAL_MY_TWEETS);
    });

    it("should emit delete tweet event", async function() {
        const TWEET_ID = 0;
        const TWEET_DELETED = true;

        const result = await twitter.deleteTweet(TWEET_ID, TWEET_DELETED, {from: addr1});
        const deleteTweetEvent = result.logs[0];

        assert.equal(deleteTweetEvent.event, "DeleteTweet");
        assert.equal(deleteTweetEvent.args.tweetId, TWEET_ID);
        assert.equal(deleteTweetEvent.args.isDeleted, TWEET_DELETED);
    });


});


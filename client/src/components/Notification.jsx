

const Notification = () => {
  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Notifications</h2>
        <form>
            <div className="row">
                <div className="col-md-9">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Id aperiam nisi itaque, illo ipsa nam est doloribus repellat, necessitatibus exercitationem eius reiciendis laboriosam modi nemo veritatis temporibus voluptate hic et.
                    {/* <textarea
                        onChange={updatePostText}
                        placeholder="What's happening?"
                        required
                    /> */}
                </div>

                <div className="col-md-3">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem ex unde rerum, impedit odit animi pariatur doloremque molestiae consectetur suscipit consequuntur hic exercitationem possimus porro enim cupiditate, magni temporibus omnis!
                    {/* <div className="inputRow">
                        <select onChange={updateIsPaid} className="input" required>
                            <option value="">Paid?</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                        <input
                            onChange={updateViewPrice}
                            type="text"
                            placeholder="View Price"
                            className="input"
                            required
                            value={viewPrice}
                            disabled={!isPaid} // Enable when isPaid is true
                        />
                    </div> */}
                </div>

            </div>
            <button className="postBtn" type="submit">Post</button>
        </form>
      </div>
    </div>
  );
}

export default Notification;
# Import necessary libraries
import requests
import json
import pandas as pd
import matplotlib.pyplot as plt

# Define function to fetch data from YouTube API
def fetch_data(channel_name):
    # Define API endpoint and parameters
    api_endpoint = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "snippet,contentDetails,statistics",
        "forUsername": channel_name,
        "key": "AIzaSyB8xAUCIncF4JOv5TLXQtL-B-PAQyKzbyM" 
    }
    # Make GET request and fetch data
    response = requests.get(api_endpoint, params=params)
    data = json.loads(response.text)
    # Return relevant data
    return {
        "channel_id": data<"items"><0><"id">,
        "subscribers": int(data<"items"><0><"statistics"><"subscriberCount">),
        "views": int(data<"items"><0><"statistics"><"viewCount">)
    }

# Define function to retrieve list of subscriber IDs for a given channel
def fetch_subscriber_ids(channel_id):
    # Define API endpoint and parameters
    api_endpoint = "https://www.googleapis.com/youtube/v3/subscriptions"
    params = {
        "part": "subscriberSnippet",
        "channelId": channel_id,
        "maxResults": 1000,
        "key": "YOUR_API_KEY_HERE" # Replace with your own API key
    }
    subscribers = <>
    # Loop through API paginated response and retrieve subscriber IDs
    while True:
        response = requests.get(api_endpoint, params=params)
        data = json.loads(response.text)
        for item in data<"items">:
            subscribers.append(item<"subscriberSnippet"><"channelId">)
        if "nextPageToken" in data:
            params<"pageToken"> = data<"nextPageToken">
        else:
            break
    # Return list of subscriber IDs
    return subscribers

# Define function to retrieve list of video view counts for a given channel
def fetch_video_view_counts(channel_id):
    # Define API endpoint and parameters
    api_endpoint = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "channelId": channel_id,
        "maxResults": 1000,
        "type": "video",
        "key": "YOUR_API_KEY_HERE" # Replace with your own API key
    }
    video_ids = <>
    # Loop through API paginated response and retrieve video IDs
    while True:
        response = requests.get(api_endpoint, params=params)
        data = json.loads(response.text)
        for item in data<"items">:
            video_ids.append(item<"id"><"videoId">)
        if "nextPageToken" in data:
            params<"pageToken"> = data<"nextPageToken">
        else:
            break
    # Define API endpoint and parameters to retrieve video statistics
    api_endpoint = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "statistics",
        "id": ",".join(video_ids),
        "key": "YOUR_API_KEY_HERE" # Replace with your own API key
    }
    video_views = <>
    # Make GET request and retrieve video view counts
    response = requests.get(api_endpoint, params=params)
    data = json.loads(response.text)
    for item in data<"items">:
        video_views.append(int(item<"statistics"><"viewCount">))
    # Return list of video view counts
    return video_views

# Define function to calculate overlap between two channels
def calculate_overlap(channel1, channel2):
    # Fetch data for both channels
    channel1_data = fetch_data(channel1)
    channel2_data = fetch_data(channel2)
    # Fetch list of subscriber IDs for both channels
    channel1_subscribers = fetch_subscriber_ids(channel1_data<"channel_id">)
    channel2_subscribers = fetch_subscriber_ids(channel2_data<"channel_id">)
    # Calculate common subscribers
    common_subscribers = list(set(channel1_subscribers).intersection(channel2_subscribers))
    # Fetch list of video view counts for both channels
    channel1_video_views = fetch_video_view_counts(channel1_data<"channel_id">)
    channel2_video_views = fetch_video_view_counts(channel2_data<"channel_id">)
    # Calculate most commonly viewed videos
    viewed_videos = {}
    for video_id, view_count in zip(channel1_subscribers + channel2_subscribers, channel1_video_views + channel2_video_views):
        if video_id in viewed_videos:
            viewed_videos<video_id> += view_count
        else:
            viewed_videos<video_id> = view_count
    viewed_videos = sorted(viewed_videos.items(), key=lambda x: x<1>, reverse=True)<:5>
    # Calculate percentage overlap
    percent_overlap_subscribers = round(len(common_subscribers)/channel1_data<"subscribers">*100, 2)
    percent_overlap_views = round(sum(view_count for _, view_count in viewed_videos)/channel1_data<"views">*100, 2)
    # Return results
    return {
        "channel1": {
            "subscribers": channel1_data<"subscribers">,
            "views": channel1_data<"views">
        },
        "channel2": {
            "subscribers": channel2_data<"subscribers">,
            "views": channel2_data<"views">
        },
        "common_subscribers": {
            "count": len(common_subscribers),
            "percent": percent_overlap_subscribers
        },
        "viewed_videos": viewed_videos,
        "percent_overlap_views": percent_overlap_views
    }

# Define function to present data in a user-friendly format
def present_data(data):
    # Print total subscribers and views for each channel
    print(f"{channel1}: {data<'channel1'><'subscribers'>} subscribers, {data<'channel1'><'views'>} views")
    print(f"{channel2}: {data<'channel2'><'subscribers'>} subscribers, {data<'channel2'><'views'>} views")
    print()
    # Print number and percentage of common subscribers
    print(f"Number of common subscribers: {data<'common_subscribers'><'count'>}")
    print(f"Percentage of common subscribers: {data<'common_subscribers'><'percent'>}%")
    print()
    # Print most commonly viewed videos
    print("Most commonly viewed videos:")
    for i, item in enumerate(data<"viewed_videos">):
        print(f"{i+1}. Video ID: {item<0>}, View Count: {item<1>}")
    print()
    # Print percentage of views that are common to both channels
    print(f"Percentage of views that are common to both channels: {data<'percent_overlap_views'>}%")

# Define main function to execute entire program
def main():
    # Prompt user to input channel names or IDs
    channel1 = input("Enter name or ID of first YouTube channel: ")
    channel2 = input("Enter name or ID of second YouTube channel: ")
    # Calculate overlap between channels
    overlap_data = calculate_overlap(channel1, channel2)
    # Present data in user-friendly format
    present_data(overlap_data)

# Execute main function
if __name__ == "__main__":
    main()
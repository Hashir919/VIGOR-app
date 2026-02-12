
# Download Script
$urls = @{
    "community_feed.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ExMTM3ZTZjMzUxYjRkOTliNGJkZjg2ZTYzYzBhZmY2EgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
    "health_metrics.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU3YTY2MmIwZGM5ZDQ4ZTg4OGU0YzBmZmIyNzVhMWFkEgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
    "log_workout.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzljYmEyZWY2MmE2NzQxOGNiMDU5M2ZkZDdmNzYwNWEyEgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
    "activity_history.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzgwYzY2NGEyNDliNTQwOGJiY2EzMzZhNjg3ZGU4MjgxEgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
    "user_profile.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdmYmVkODczNjBlMTQ5ZDg4NTUyYjIyYjY5YTRhYmQ4EgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
    "fitness_dashboard.html" = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2IwMjQ1ZjQ4OTRjYzQ4MDg5YjY3MWJmZjgyOThhMDhmEgsSBxCckbH3tAsYAZIBJAoKcHJvamVjdF9pZBIWQhQxODI0NjIyMTI0MjQwNzEyNzc4Mg&filename=&opi=89354086"
}

foreach ($item in $urls.GetEnumerator()) {
    $filename = $item.Key
    $url = $item.Value
    echo "Downloading $filename..."
    Invoke-WebRequest -Uri $url -OutFile "raw_assets/$filename"
}

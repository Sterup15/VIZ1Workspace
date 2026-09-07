function createCircleChart(data) {
    const streamsByReleaseDecadeSection = d3.select('#release-by-decade');
    streamsByReleaseDecadeSection.append('h3').text('US on-demand audio streams, by release decade');

    const width = 550;
    const height = 130;
    const maxCircleRadius = 40;
    const circleY = 20;
    const headerOffset = 5;
    const footerOffset = 30;

    // Continue here
}
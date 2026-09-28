const tooltipMargin = { top: 0, right: 0, bottom: 20, left: 10 }

function setTooltipText(datapoints, tooltip, xValue, isTextAnchorStart, toLabel) {
    tooltip.selectAll('text').remove();
    Object.entries(datapoints).forEach(([key, value], i) => {
        tooltip.append('text')
            .attr('x', `${isTextAnchorStart ? (xValue + tooltipMargin.left) : (xValue - tooltipMargin.left)}`)
            .attr('y', i * tooltipMargin.bottom)
            .attr('text-anchor', isTextAnchorStart ? 'start' : 'end')
            .text(`${toLabel(key)}: ${value}`);
    });
}

function initializeTooltip(svgContainer) {
    const tooltip = svgContainer.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    return tooltip.append('g');
}

function initializeTooltipLine(tooltip){
        // Append vertical line for tooltip
    return tooltip
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
}
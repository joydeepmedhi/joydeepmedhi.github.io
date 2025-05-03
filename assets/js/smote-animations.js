document.addEventListener('DOMContentLoaded', function() {
    // Configuration for all animations
    const config = {
      majorityPoints: 30,    // Reduced from 80
      minorityPoints: 8,     // Reduced from 10
      syntheticLimit: 15,    // Stop after generating this many synthetic samples
      cycleCount: 3,         // Number of complete cycles before restarting
      phaseDuration: 1000,   // Duration of each phase in ms
      autoRestartDelay: 2000 // Pause before restarting animation
    };
    
    // Initialize each canvas if it exists
    initCanvas('standard-smote-canvas', standardSmoteAnimation);
    initCanvas('borderline-smote-canvas', borderlineSmoteAnimation);
    initCanvas('adasyn-canvas', adasynAnimation);
    initCanvas('kmeans-smote-canvas', kmeansSmoteAnimation);
    initCanvas('svm-smote-canvas', svmSmoteAnimation);
    
    // Common initialization function for all canvases
    function initCanvas(canvasId, animationFunction) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;
      
      // Handle high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      // Run the specific animation for this canvas
      animationFunction(canvas, ctx, width, height);
      
      // Add visible border to canvas
      canvas.style.border = '1px solid #ddd';
      canvas.style.borderRadius = '4px';
    }
    
    // Standard SMOTE Animation
    function standardSmoteAnimation(canvas, ctx, width, height) {
      // Define layout areas
      const plotArea = {
        x: 50,
        y: 50,
        width: width - 250,
        height: height - 100
      };
      
      const legendArea = {
        x: plotArea.x + plotArea.width + 20,
        y: 50,
        width: 200,
        height: 160
      };
      
      // Generate dataset
      const { majorityPoints, minorityPoints } = generateDataset(plotArea, 'standard');
      
      // Find k-nearest neighbors for each minority point
      setupNeighbors(minorityPoints);
      
      // Animation state
      const state = {
        syntheticPoints: [],
        animPhase: 0,
        currentMinorityIndex: 0,
        animationFrameId: null,
        animStartTime: 0,
        currentSyntheticPoint: null,
        generationComplete: false,
        highlightedPoints: [],
        animationProgress: 0,
        cycleCount: 0,
        totalCycles: 0,
        isPaused: false
      };
      
      // Start animation
      startAnimation();
      
      function startAnimation() {
        // Reset state for a new animation
        state.animStartTime = 0;
        state.isPaused = false;
        
        // If we've reached the synthetic limit, restart from scratch
        if (state.syntheticPoints.length >= config.syntheticLimit) {
          state.syntheticPoints = [];
          state.totalCycles = 0;
          state.cycleCount = 0;
          state.currentMinorityIndex = 0;
        }
        
        state.animationFrameId = requestAnimationFrame(animate);
      }
      
      function animate(timestamp) {
        if (!state.animStartTime) state.animStartTime = timestamp;
        const elapsed = timestamp - state.animStartTime;
        
        // Clear canvas and draw layout
        drawLayout();
        
        // Phase timing calculations
        const cycleDuration = config.phaseDuration * 4; // 4 phases per cycle
        const cycleTime = elapsed % cycleDuration;
        state.animPhase = Math.floor(cycleTime / config.phaseDuration);
        state.animationProgress = (cycleTime % config.phaseDuration) / config.phaseDuration;
        
        // Draw legend
        drawLegend(legendArea.x + 10, legendArea.y + 30);
        
        // Draw title and phase description
        drawTitle("Standard SMOTE", 20, 30);
        drawPhaseDescription(state.animPhase, legendArea.x + 10, legendArea.y + 180);
        
        // Always draw points
        drawPoints(majorityPoints, '#8884d8', 'circle'); // Majority points (blue)
        drawPoints(minorityPoints, '#ff5252', 'circle'); // Minority points (red)
        drawPoints(state.syntheticPoints, '#4caf50', 'circle'); // Synthetic points (green)
        
        // Track when a full cycle completes
        if (state.animPhase === 3 && state.animationProgress > 0.9) {
          if (!state.cycleCount) {
            state.cycleCount = 1;
            state.totalCycles++;
          }
        } else {
          state.cycleCount = 0;
        }
        
        // Process based on animation phase
        switch (state.animPhase) {
          case 0: // Show original dataset
            state.highlightedPoints = [];
            break;
            
          case 1: // Highlight minority point and neighbors
            // If we're on a new cycle, select a new minority point
            if (state.animationProgress < 0.1 && !state.highlightedPoints.length) {
              state.currentMinorityIndex = (state.currentMinorityIndex + 1) % minorityPoints.length;
              const neighborIndex = Math.floor(Math.random() * minorityPoints[state.currentMinorityIndex].neighbors.length);
              
              // Highlight the current minority point and one of its neighbors
              state.highlightedPoints = [
                { 
                  ...minorityPoints[state.currentMinorityIndex], 
                  color: '#ff9800', // orange
                  radius: 5
                },
                { 
                  ...minorityPoints[state.currentMinorityIndex].neighbors[neighborIndex], 
                  color: '#9c27b0', // purple
                  radius: 5
                }
              ];
            }
            
            // Draw highlighted points and connection line
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            break;
            
          case 2: // Generate synthetic sample
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
              
              // Calculate and draw the synthetic point with animation
              if (!state.currentSyntheticPoint) {
                const alpha = Math.random(); // Random interpolation factor
                const p1 = state.highlightedPoints[0];
                const p2 = state.highlightedPoints[1];
                
                state.currentSyntheticPoint = {
                  x: p1.x + alpha * (p2.x - p1.x),
                  y: p1.y + alpha * (p2.y - p1.y),
                  radius: 4,
                  alpha: alpha,
                  startPoint: p1,
                  endPoint: p2
                };
              }
              
              // Animate synthetic point generation
              const p1 = state.currentSyntheticPoint.startPoint;
              const p2 = state.currentSyntheticPoint.endPoint;
              const alpha = state.currentSyntheticPoint.alpha;
              const progress = Math.min(1, state.animationProgress * 2);
              
              const currentX = p1.x + progress * alpha * (p2.x - p1.x);
              const currentY = p1.y + progress * alpha * (p2.y - p1.y);
              
              // Draw synthetic point
              ctx.beginPath();
              ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
              ctx.fillStyle = '#4caf50';
              ctx.fill();
              ctx.strokeStyle = '#333';
              ctx.stroke();
              
              // Draw formula value
              const formulaBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 160,
                height: 40
              };
              
              drawFormulaBox(formulaBox, alpha, progress);
              
              // Add to synthetic points collection when animation completes
              if (progress === 1 && state.animationProgress > 0.9 && !state.generationComplete) {
                if (state.syntheticPoints.length < config.syntheticLimit) {
                  state.syntheticPoints.push({
                    x: currentX,
                    y: currentY,
                    radius: 3
                  });
                }
                state.generationComplete = true;
              }
            }
            break;
            
          case 3: // Reset for next cycle
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            
            // Draw synthetic count
            const countBox = {
              x: plotArea.x + 10,
              y: plotArea.y + 10,
              width: 220,
              height: 30
            };
            
            drawCountBox(countBox);
            
            // Reset for next cycle
            if (state.animationProgress > 0.9) {
              state.currentSyntheticPoint = null;
              state.generationComplete = false;
            }
            break;
        }
        
        // Check if we need to stop and restart
        if (state.syntheticPoints.length >= config.syntheticLimit && !state.isPaused) {
          state.isPaused = true;
          // Show completed state
          drawRestartMessage();
          
          // Schedule restart after delay
          setTimeout(() => {
            startAnimation();
          }, config.autoRestartDelay);
        } else if (!state.isPaused) {
          // Continue animation
          state.animationFrameId = requestAnimationFrame(animate);
        }
      }
      
      function drawLayout() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw plot area background
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        
        // Vertical grid lines
        for (let x = plotArea.x + 50; x < plotArea.x + plotArea.width; x += 50) {
          ctx.moveTo(x, plotArea.y);
          ctx.lineTo(x, plotArea.y + plotArea.height);
        }
        
        // Horizontal grid lines
        for (let y = plotArea.y + 50; y < plotArea.y + plotArea.height; y += 50) {
          ctx.moveTo(plotArea.x, y);
          ctx.lineTo(plotArea.x + plotArea.width, y);
        }
        
        ctx.stroke();
        
        // Draw legend area
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        
        // Draw algorithm area - at the bottom
        const algorithmArea = {
          x: 50,
          y: plotArea.y + plotArea.height + 10,
          width: width - 100,
          height: 30
        };
        
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        
        // Draw algorithm formula
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('new_point = point1 + α × (point2 - point1), where α is random(0,1)', algorithmArea.x + 10, algorithmArea.y + 20);
      }
      
      function drawTitle(title, x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, x, y);
      }
      
      function drawConnectionLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#aaa';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      function drawFormulaBox(box, alpha, progress) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`α = ${alpha.toFixed(2)}`, box.x + 10, box.y + 15);
        ctx.fillText(`Progress: ${(progress * 100).toFixed(0)}%`, box.x + 10, box.y + 30);
      }
      
      function drawCountBox(box) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Created ${state.syntheticPoints.length} of ${config.syntheticLimit} samples`, box.x + 10, box.y + 20);
      }
      
      function drawRestartMessage() {
        const msgBox = {
          x: plotArea.x + plotArea.width/4,
          y: plotArea.y + plotArea.height/2 - 20,
          width: plotArea.width/2,
          height: 40
        };
        
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restarting animation...', msgBox.x + msgBox.width/2, msgBox.y + 25);
        ctx.textAlign = 'left'; // Reset alignment
      }
      
      function drawLegend(x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Legend', x, y - 15);
        
        const items = [
          { color: '#8884d8', label: 'Majority Class' },
          { color: '#ff5252', label: 'Minority Class' },
          { color: '#4caf50', label: 'Synthetic Samples' },
          { color: '#ff9800', label: 'Selected Sample', shape: 'star' },
          { color: '#9c27b0', label: 'Selected Neighbor', shape: 'star' }
        ];
        
        let offsetY = 0;
        items.forEach(item => {
          ctx.beginPath();
          if (item.shape === 'star') {
            drawStar(x + 10, y + offsetY + 7, 8, 5);
          } else {
            ctx.arc(x + 10, y + offsetY + 7, 5, 0, 2 * Math.PI);
          }
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
          
          ctx.fillStyle = '#333';
          ctx.font = '14px Arial';
          ctx.fillText(item.label, x + 25, y + offsetY + 12);
          
          offsetY += 25;
        });
      }
      
      function drawPhaseDescription(phase, x, y) {
        const descriptions = [
          "Original dataset",
          "Identifying minority sample",
          "Creating synthetic sample",
          "Adding to collection"
        ];
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Current Step:', x, y);
        ctx.font = '14px Arial';
        ctx.fillText(descriptions[phase], x, y + 20);
      }
      
      function drawPoints(points, defaultColor, shape = 'circle') {
        points.forEach(point => {
          ctx.beginPath();
          
          const color = point.color || defaultColor;
          ctx.fillStyle = color;
          
          if (shape === 'circle') {
            ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          } else if (shape === 'star') {
            drawStar(point.x, point.y, point.radius * 2, 5);
          }
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
        });
      }
      
      function drawStar(x, y, radius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? radius : radius/2;
          const currX = x + Math.cos(rot) * r;
          const currY = y + Math.sin(rot) * r;
          ctx.lineTo(currX, currY);
          rot += step;
        }
        
        ctx.closePath();
      }
      
      // Add observer to pause animation when not visible
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!state.animationFrameId && !state.isPaused) {
            state.animStartTime = 0; // Reset animation time
            state.animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }
        }
      }, { threshold: 0.1 });
      
      observer.observe(canvas);
      
      // Cleanup on page changes
      window.addEventListener('beforeunload', () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        observer.disconnect();
      });
    }
    
    // Borderline SMOTE Animation
    function borderlineSmoteAnimation(canvas, ctx, width, height) {
      // Similar structure to standardSmoteAnimation but with borderline-specific logic
      // Define layout areas
      const plotArea = {
        x: 50,
        y: 50,
        width: width - 250,
        height: height - 100
      };
      
      const legendArea = {
        x: plotArea.x + plotArea.width + 20,
        y: 50,
        width: 200,
        height: 180
      };
      
      // Generate dataset with majority points closer to some minority points
      const { majorityPoints, minorityPoints } = generateDataset(plotArea, 'borderline');
      
      // Find k-nearest neighbors and identify borderline points
      setupNeighbors(minorityPoints);
      identifyBorderlinePoints(minorityPoints, majorityPoints);
      
      // Animation state
      const state = {
        syntheticPoints: [],
        animPhase: 0,
        currentMinorityIndex: 0,
        animationFrameId: null,
        animStartTime: 0,
        currentSyntheticPoint: null,
        generationComplete: false,
        highlightedPoints: [],
        animationProgress: 0,
        cycleCount: 0,
        totalCycles: 0,
        isPaused: false,
        borderlinePoints: minorityPoints.filter(p => p.isBorderline)
      };
      
      // Start animation
      startAnimation();
      
      function startAnimation() {
        // Reset state for a new animation
        state.animStartTime = 0;
        state.isPaused = false;
        
        // If we've reached the synthetic limit, restart from scratch
        if (state.syntheticPoints.length >= config.syntheticLimit) {
          state.syntheticPoints = [];
          state.totalCycles = 0;
          state.cycleCount = 0;
          state.currentMinorityIndex = 0;
        }
        
        state.animationFrameId = requestAnimationFrame(animate);
      }
      
      function animate(timestamp) {
        if (!state.animStartTime) state.animStartTime = timestamp;
        const elapsed = timestamp - state.animStartTime;
        
        // Clear canvas and draw layout
        drawLayout();
        
        // Phase timing calculations
        const cycleDuration = config.phaseDuration * 4; // 4 phases per cycle
        const cycleTime = elapsed % cycleDuration;
        state.animPhase = Math.floor(cycleTime / config.phaseDuration);
        state.animationProgress = (cycleTime % config.phaseDuration) / config.phaseDuration;
        
        // Draw legend
        drawLegend(legendArea.x + 10, legendArea.y + 30);
        
        // Draw title and phase description
        drawTitle("Borderline-SMOTE", 20, 30);
        drawPhaseDescription(state.animPhase, legendArea.x + 10, legendArea.y + 200);
        
        // Always draw points
        drawPoints(majorityPoints, '#8884d8', 'circle'); // Majority points (blue)
        
        // Draw minority points - highlight borderline points
        drawPoints(minorityPoints.filter(p => !p.isBorderline), '#ff5252', 'circle'); // Safe minority points (red)
        drawPoints(minorityPoints.filter(p => p.isBorderline), '#ff8f00', 'circle'); // Borderline minority points (orange)
        
        // Draw synthetic points
        drawPoints(state.syntheticPoints, '#4caf50', 'circle'); // Synthetic points (green)
        
        // Track when a full cycle completes
        if (state.animPhase === 3 && state.animationProgress > 0.9) {
          if (!state.cycleCount) {
            state.cycleCount = 1;
            state.totalCycles++;
          }
        } else {
          state.cycleCount = 0;
        }
        
        // Process based on animation phase
        switch (state.animPhase) {
          case 0: // Show original dataset and identify borderline points
            state.highlightedPoints = [];
            
            // Draw lines to show majority neighbors for borderline points
            if (state.borderlinePoints.length > 0) {
              const samplePoint = state.borderlinePoints[state.currentMinorityIndex % state.borderlinePoints.length];
              
              // Show connections to majority neighbors
              samplePoint.majorityNeighbors.forEach(neighbor => {
                drawConnectionLine(samplePoint, neighbor, '#8884d8');
              });
              
              // Highlight the borderline point
              drawPoints([{...samplePoint, radius: 5}], '#ff8f00', 'circle');
            }
            break;
            
          case 1: // Select a borderline point and one of its minority neighbors
            // If we're on a new cycle, select a new borderline point
            if (state.animationProgress < 0.1 && !state.highlightedPoints.length) {
              if (state.borderlinePoints.length > 0) {
                const borderlineIndex = state.currentMinorityIndex % state.borderlinePoints.length;
                const borderlinePoint = state.borderlinePoints[borderlineIndex];
                
                // Find a minority neighbor for this borderline point
                const minorityNeighbors = borderlinePoint.neighbors.filter(
                  n => minorityPoints.some(p => p.x === n.x && p.y === n.y)
                );
                
                if (minorityNeighbors.length > 0) {
                  const neighborIndex = Math.floor(Math.random() * minorityNeighbors.length);
                  
                  // Highlight the borderline point and its minority neighbor
                  state.highlightedPoints = [
                    { 
                      ...borderlinePoint, 
                      color: '#ff8f00', // orange
                      radius: 5
                    },
                    { 
                      ...minorityNeighbors[neighborIndex], 
                      color: '#9c27b0', // purple
                      radius: 5
                    }
                  ];
                }
                
                state.currentMinorityIndex++;
              }
            }
            
            // Draw highlighted points and connection line
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            break;
            
          case 2: // Generate synthetic sample
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
              
              // Calculate and draw the synthetic point with animation
              if (!state.currentSyntheticPoint) {
                const alpha = Math.random(); // Random interpolation factor
                const p1 = state.highlightedPoints[0];
                const p2 = state.highlightedPoints[1];
                
                state.currentSyntheticPoint = {
                  x: p1.x + alpha * (p2.x - p1.x),
                  y: p1.y + alpha * (p2.y - p1.y),
                  radius: 4,
                  alpha: alpha,
                  startPoint: p1,
                  endPoint: p2
                };
              }
              
              // Animate synthetic point generation
              const p1 = state.currentSyntheticPoint.startPoint;
              const p2 = state.currentSyntheticPoint.endPoint;
              const alpha = state.currentSyntheticPoint.alpha;
              const progress = Math.min(1, state.animationProgress * 2);
              
              const currentX = p1.x + progress * alpha * (p2.x - p1.x);
              const currentY = p1.y + progress * alpha * (p2.y - p1.y);
              
              // Draw synthetic point
              ctx.beginPath();
              ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
              ctx.fillStyle = '#4caf50';
              ctx.fill();
              ctx.strokeStyle = '#333';
              ctx.stroke();
              
              // Draw formula value
              const formulaBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 160,
                height: 40
              };
              
              drawFormulaBox(formulaBox, alpha, progress);
              
              // Add to synthetic points collection when animation completes
              if (progress === 1 && state.animationProgress > 0.9 && !state.generationComplete) {
                if (state.syntheticPoints.length < config.syntheticLimit) {
                  state.syntheticPoints.push({
                    x: currentX,
                    y: currentY,
                    radius: 3
                  });
                }
                state.generationComplete = true;
              }
            }
            break;
            
          case 3: // Reset for next cycle
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            
            // Draw synthetic count
            const countBox = {
              x: plotArea.x + 10,
              y: plotArea.y + 10,
              width: 220,
              height: 30
            };
            
            drawCountBox(countBox);
            
            // Reset for next cycle
            if (state.animationProgress > 0.9) {
              state.currentSyntheticPoint = null;
              state.generationComplete = false;
            }
            break;
        }
        
        // Check if we need to stop and restart
        if (state.syntheticPoints.length >= config.syntheticLimit && !state.isPaused) {
          state.isPaused = true;
          // Show completed state
          drawRestartMessage();
          
          // Schedule restart after delay
          setTimeout(() => {
            startAnimation();
          }, config.autoRestartDelay);
        } else if (!state.isPaused) {
          // Continue animation
          state.animationFrameId = requestAnimationFrame(animate);
        }
      }
      
      // Drawing functions similar to standardSmoteAnimation with borderline-specific adjustments
      function drawLayout() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw plot area background
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        
        // Vertical grid lines
        for (let x = plotArea.x + 50; x < plotArea.x + plotArea.width; x += 50) {
          ctx.moveTo(x, plotArea.y);
          ctx.lineTo(x, plotArea.y + plotArea.height);
        }
        
        // Horizontal grid lines
        for (let y = plotArea.y + 50; y < plotArea.y + plotArea.height; y += 50) {
          ctx.moveTo(plotArea.x, y);
          ctx.lineTo(plotArea.x + plotArea.width, y);
        }
        
        ctx.stroke();
        
        // Draw legend area
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        
        // Draw algorithm area - at the bottom
        const algorithmArea = {
          x: 50,
          y: plotArea.y + plotArea.height + 10,
          width: width - 100,
          height: 30
        };
        
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        
        // Draw algorithm formula
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Borderline-SMOTE: Only generate samples from minority points near the boundary', algorithmArea.x + 10, algorithmArea.y + 20);
      }
      
      function drawTitle(title, x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, x, y);
      }
      
      function drawConnectionLine(p1, p2, color = '#aaa') {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = color;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      function drawFormulaBox(box, alpha, progress) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`α = ${alpha.toFixed(2)}`, box.x + 10, box.y + 15);
        ctx.fillText(`Progress: ${(progress * 100).toFixed(0)}%`, box.x + 10, box.y + 30);
      }
      
      function drawCountBox(box) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Created ${state.syntheticPoints.length} of ${config.syntheticLimit} samples`, box.x + 10, box.y + 20);
      }
      
      function drawRestartMessage() {
        const msgBox = {
          x: plotArea.x + plotArea.width/4,
          y: plotArea.y + plotArea.height/2 - 20,
          width: plotArea.width/2,
          height: 40
        };
        
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restarting animation...', msgBox.x + msgBox.width/2, msgBox.y + 25);
        ctx.textAlign = 'left'; // Reset alignment
      }
      
      function drawLegend(x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Legend', x, y - 15);
        
        const items = [
          { color: '#8884d8', label: 'Majority Class' },
          { color: '#ff5252', label: 'Safe Minority' },
          { color: '#ff8f00', label: 'Borderline Minority' },
          { color: '#4caf50', label: 'Synthetic Samples' },
          { color: '#9c27b0', label: 'Selected Neighbor', shape: 'star' }
        ];
        
        let offsetY = 0;
        items.forEach(item => {
          ctx.beginPath();
          if (item.shape === 'star') {
            drawStar(x + 10, y + offsetY + 7, 8, 5);
          } else {
            ctx.arc(x + 10, y + offsetY + 7, 5, 0, 2 * Math.PI);
          }
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
          
          ctx.fillStyle = '#333';
          ctx.font = '14px Arial';
          ctx.fillText(item.label, x + 25, y + offsetY + 12);
          
          offsetY += 25;
        });
      }
      
      function drawPhaseDescription(phase, x, y) {
        const descriptions = [
          "Identifying borderline points",
          "Selecting borderline point",
          "Creating synthetic sample",
          "Adding to collection"
        ];
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Current Step:', x, y);
        ctx.font = '14px Arial';
        ctx.fillText(descriptions[phase], x, y + 20);
      }
      
      function drawPoints(points, defaultColor, shape = 'circle') {
        points.forEach(point => {
          ctx.beginPath();
          
          const color = point.color || defaultColor;
          ctx.fillStyle = color;
          
          if (shape === 'circle') {
            ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          } else if (shape === 'star') {
            drawStar(point.x, point.y, point.radius * 2, 5);
          }
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
        });
      }
      
      function drawStar(x, y, radius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? radius : radius/2;
          const currX = x + Math.cos(rot) * r;
          const currY = y + Math.sin(rot) * r;
          ctx.lineTo(currX, currY);
          rot += step;
        }
        
        ctx.closePath();
      }
      
      // Add observer to pause animation when not visible
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!state.animationFrameId && !state.isPaused) {
            state.animStartTime = 0; // Reset animation time
            state.animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }
        }
      }, { threshold: 0.1 });
      
      observer.observe(canvas);
      
      // Cleanup on page changes
      window.addEventListener('beforeunload', () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        observer.disconnect();
      });
    }
    
    // ADASYN Animation
    function adasynAnimation(canvas, ctx, width, height) {
      // Similar structure but with ADASYN-specific logic
      // Define layout areas
      const plotArea = {
        x: 50,
        y: 50,
        width: width - 250,
        height: height - 100
      };
      
      const legendArea = {
        x: plotArea.x + plotArea.width + 20,
        y: 50,
        width: 200,
        height: 180
      };
      
      // Generate dataset
      const { majorityPoints, minorityPoints } = generateDataset(plotArea, 'adasyn');
      
      // Find k-nearest neighbors for each minority point and calculate difficulty level
      setupNeighbors(minorityPoints);
      calculateDifficultyWeights(minorityPoints, majorityPoints);
      
      // Animation state
      const state = {
        syntheticPoints: [],
        animPhase: 0,
        currentMinorityIndex: 0,
        animationFrameId: null,
        animStartTime: 0,
        currentSyntheticPoint: null,
        generationComplete: false,
        highlightedPoints: [],
        animationProgress: 0,
        cycleCount: 0,
        totalCycles: 0,
        isPaused: false
      };
      
      // Start animation
      startAnimation();
      
      function startAnimation() {
        // Reset state for a new animation
        state.animStartTime = 0;
        state.isPaused = false;
        
        // If we've reached the synthetic limit, restart from scratch
        if (state.syntheticPoints.length >= config.syntheticLimit) {
          state.syntheticPoints = [];
          state.totalCycles = 0;
          state.cycleCount = 0;
          state.currentMinorityIndex = 0;
        }
        
        state.animationFrameId = requestAnimationFrame(animate);
      }
      
      function animate(timestamp) {
        if (!state.animStartTime) state.animStartTime = timestamp;
        const elapsed = timestamp - state.animStartTime;
        
        // Clear canvas and draw layout
        drawLayout();
        
        // Phase timing calculations
        const cycleDuration = config.phaseDuration * 4; // 4 phases per cycle
        const cycleTime = elapsed % cycleDuration;
        state.animPhase = Math.floor(cycleTime / config.phaseDuration);
        state.animationProgress = (cycleTime % config.phaseDuration) / config.phaseDuration;
        
        // Draw legend
        drawLegend(legendArea.x + 10, legendArea.y + 30);
        
        // Draw title and phase description
        drawTitle("ADASYN", 20, 30);
        drawPhaseDescription(state.animPhase, legendArea.x + 10, legendArea.y + 200);
        
        // Always draw majority points
        drawPoints(majorityPoints, '#8884d8', 'circle'); // Majority points (blue)
        
        // Draw minority points - with color intensity based on difficulty
        drawMinorityPointsWithDifficulty(minorityPoints);
        
        // Draw synthetic points
        drawPoints(state.syntheticPoints, '#4caf50', 'circle'); // Synthetic points (green)
        
        // Track when a full cycle completes
        if (state.animPhase === 3 && state.animationProgress > 0.9) {
          if (!state.cycleCount) {
            state.cycleCount = 1;
            state.totalCycles++;
          }
        } else {
          state.cycleCount = 0;
        }
        
        // Process based on animation phase
        switch (state.animPhase) {
          case 0: // Show original dataset with difficulty weights
            state.highlightedPoints = [];
            
            // Show difficulty gauge for each minority point
            minorityPoints.forEach(point => {
              drawDifficultyGauge(point);
            });
            break;
            
          case 1: // Select a minority point based on difficulty
            // If we're on a new cycle, select a new minority point
            if (state.animationProgress < 0.1 && !state.highlightedPoints.length) {
              // Weight selection by difficulty (points with higher difficulty more likely to be selected)
              const weightedIndex = selectWeightedMinorityPoint(minorityPoints);
              const point = minorityPoints[weightedIndex];
              const neighborIndex = Math.floor(Math.random() * point.neighbors.length);
              
              // Highlight the selected point and one of its neighbors
              state.highlightedPoints = [
                { 
                  ...point, 
                  color: '#ff9800', // orange
                  radius: 5
                },
                { 
                  ...point.neighbors[neighborIndex], 
                  color: '#9c27b0', // purple
                  radius: 5
                }
              ];
              
              state.currentMinorityIndex = weightedIndex;
            }
            
            // Draw highlighted points and connection line
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
              
              // Show difficulty gauge for the selected point
              drawDifficultyGauge(minorityPoints[state.currentMinorityIndex], true);
            }
            break;
            
          case 2: // Generate synthetic sample
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
              
              // Calculate and draw the synthetic point with animation
              if (!state.currentSyntheticPoint) {
                const alpha = Math.random(); // Random interpolation factor
                const p1 = state.highlightedPoints[0];
                const p2 = state.highlightedPoints[1];
                
                state.currentSyntheticPoint = {
                  x: p1.x + alpha * (p2.x - p1.x),
                  y: p1.y + alpha * (p2.y - p1.y),
                  radius: 4,
                  alpha: alpha,
                  startPoint: p1,
                  endPoint: p2
                };
              }
              
              // Animate synthetic point generation
              const p1 = state.currentSyntheticPoint.startPoint;
              const p2 = state.currentSyntheticPoint.endPoint;
              const alpha = state.currentSyntheticPoint.alpha;
              const progress = Math.min(1, state.animationProgress * 2);
              
              const currentX = p1.x + progress * alpha * (p2.x - p1.x);
              const currentY = p1.y + progress * alpha * (p2.y - p1.y);
              
              // Draw synthetic point
              ctx.beginPath();
              ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
              ctx.fillStyle = '#4caf50';
              ctx.fill();
              ctx.strokeStyle = '#333';
              ctx.stroke();
              
              // Draw formula value and difficulty
              const formulaBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 200,
                height: 60
              };
              
              drawFormulaBox(formulaBox, alpha, progress, minorityPoints[state.currentMinorityIndex].difficulty);
              
              // Add to synthetic points collection when animation completes
              if (progress === 1 && state.animationProgress > 0.9 && !state.generationComplete) {
                if (state.syntheticPoints.length < config.syntheticLimit) {
                  state.syntheticPoints.push({
                    x: currentX,
                    y: currentY,
                    radius: 3,
                    difficulty: minorityPoints[state.currentMinorityIndex].difficulty
                  });
                }
                state.generationComplete = true;
              }
            }
            break;
            
          case 3: // Reset for next cycle
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            
            // Draw synthetic count
            const countBox = {
              x: plotArea.x + 10,
              y: plotArea.y + 10,
              width: 220,
              height: 30
            };
            
            drawCountBox(countBox);
            
            // Reset for next cycle
            if (state.animationProgress > 0.9) {
              state.currentSyntheticPoint = null;
              state.generationComplete = false;
            }
            break;
        }
        
        // Check if we need to stop and restart
        if (state.syntheticPoints.length >= config.syntheticLimit && !state.isPaused) {
          state.isPaused = true;
          // Show completed state
          drawRestartMessage();
          
          // Schedule restart after delay
          setTimeout(() => {
            startAnimation();
          }, config.autoRestartDelay);
        } else if (!state.isPaused) {
          // Continue animation
          state.animationFrameId = requestAnimationFrame(animate);
        }
      }
      
      // Drawing functions for ADASYN
      function drawLayout() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw plot area background
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        
        // Vertical grid lines
        for (let x = plotArea.x + 50; x < plotArea.x + plotArea.width; x += 50) {
          ctx.moveTo(x, plotArea.y);
          ctx.lineTo(x, plotArea.y + plotArea.height);
        }
        
        // Horizontal grid lines
        for (let y = plotArea.y + 50; y < plotArea.y + plotArea.height; y += 50) {
          ctx.moveTo(plotArea.x, y);
          ctx.lineTo(plotArea.x + plotArea.width, y);
        }
        
        ctx.stroke();
        
        // Draw legend area
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        
        // Draw algorithm area - at the bottom
        const algorithmArea = {
          x: 50,
          y: plotArea.y + plotArea.height + 10,
          width: width - 100,
          height: 30
        };
        
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        
        // Draw algorithm formula
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('ADASYN: Generate more samples for difficult minority points (with more majority neighbors)', algorithmArea.x + 10, algorithmArea.y + 20);
      }
      
      function drawTitle(title, x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, x, y);
      }
      
      function drawConnectionLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#aaa';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      function drawFormulaBox(box, alpha, progress, difficulty) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`α = ${alpha.toFixed(2)}`, box.x + 10, box.y + 15);
        ctx.fillText(`Progress: ${(progress * 100).toFixed(0)}%`, box.x + 10, box.y + 30);
        ctx.fillText(`Difficulty: ${difficulty.toFixed(2)}`, box.x + 10, box.y + 45);
      }
      
      function drawCountBox(box) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Created ${state.syntheticPoints.length} of ${config.syntheticLimit} samples`, box.x + 10, box.y + 20);
      }
      
      function drawRestartMessage() {
        const msgBox = {
          x: plotArea.x + plotArea.width/4,
          y: plotArea.y + plotArea.height/2 - 20,
          width: plotArea.width/2,
          height: 40
        };
        
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restarting animation...', msgBox.x + msgBox.width/2, msgBox.y + 25);
        ctx.textAlign = 'left'; // Reset alignment
      }
      
      function drawLegend(x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Legend', x, y - 15);
        
        const items = [
          { color: '#8884d8', label: 'Majority Class' },
          { color: '#ff5252', label: 'Low Difficulty' },
          { color: '#ff0000', label: 'High Difficulty' },
          { color: '#4caf50', label: 'Synthetic Samples' },
          { color: '#ff9800', label: 'Selected Sample', shape: 'star' },
          { color: '#9c27b0', label: 'Selected Neighbor', shape: 'star' }
        ];
        
        let offsetY = 0;
        items.forEach(item => {
          ctx.beginPath();
          if (item.shape === 'star') {
            drawStar(x + 10, y + offsetY + 7, 8, 5);
          } else {
            ctx.arc(x + 10, y + offsetY + 7, 5, 0, 2 * Math.PI);
          }
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
          
          ctx.fillStyle = '#333';
          ctx.font = '14px Arial';
          ctx.fillText(item.label, x + 25, y + offsetY + 12);
          
          offsetY += 25;
        });
      }
      
      function drawPhaseDescription(phase, x, y) {
        const descriptions = [
          "Calculating difficulty levels",
          "Selecting by difficulty",
          "Creating synthetic sample",
          "Adding to collection"
        ];
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Current Step:', x, y);
        ctx.font = '14px Arial';
        ctx.fillText(descriptions[phase], x, y + 20);
      }
      
      function drawMinorityPointsWithDifficulty(points) {
        points.forEach(point => {
          ctx.beginPath();
          
          // Color based on difficulty (red intensity increases with difficulty)
          const intensity = Math.floor(55 + 200 * point.difficulty);
          const color = `rgb(${intensity}, ${Math.max(0, 82 - 50 * point.difficulty)}, ${Math.max(0, 82 - 82 * point.difficulty)})`;
          
          ctx.fillStyle = color;
          ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
        });
      }
      
      function drawDifficultyGauge(point, highlight = false) {
        // Draw a small gauge above each point showing its difficulty
        const gaugeWidth = 20;
        const gaugeHeight = 4;
        
        const x = point.x - gaugeWidth / 2;
        const y = point.y - point.radius - gaugeHeight - 2;
        
        // Background
        ctx.fillStyle = '#ddd';
        ctx.fillRect(x, y, gaugeWidth, gaugeHeight);
        
        // Fill based on difficulty
        const fillWidth = gaugeWidth * point.difficulty;
        ctx.fillStyle = `rgb(255, ${Math.max(0, 255 - 255 * point.difficulty)}, 0)`;
        ctx.fillRect(x, y, fillWidth, gaugeHeight);
        
        // Border
        ctx.strokeStyle = highlight ? '#000' : '#999';
        ctx.lineWidth = highlight ? 1.5 : 0.5;
        ctx.strokeRect(x, y, gaugeWidth, gaugeHeight);
        ctx.lineWidth = 1; // Reset
        
        // Show value if highlighted
        if (highlight) {
          ctx.fillStyle = '#000';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${(point.difficulty * 100).toFixed(0)}%`, point.x, y - 2);
          ctx.textAlign = 'left'; // Reset
        }
      }
      
      function drawPoints(points, defaultColor, shape = 'circle') {
        points.forEach(point => {
          ctx.beginPath();
          
          const color = point.color || defaultColor;
          ctx.fillStyle = color;
          
          if (shape === 'circle') {
            ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          } else if (shape === 'star') {
            drawStar(point.x, point.y, point.radius * 2, 5);
          }
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
        });
      }
      
      function drawStar(x, y, radius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? radius : radius/2;
          const currX = x + Math.cos(rot) * r;
          const currY = y + Math.sin(rot) * r;
          ctx.lineTo(currX, currY);
          rot += step;
        }
        
        ctx.closePath();
      }
      
      // Add observer to pause animation when not visible
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!state.animationFrameId && !state.isPaused) {
            state.animStartTime = 0; // Reset animation time
            state.animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }
        }
      }, { threshold: 0.1 });
      
      observer.observe(canvas);
      
      // Cleanup on page changes
      window.addEventListener('beforeunload', () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        observer.disconnect();
      });
    }
    
    // KMeans SMOTE Animation
    function kmeansSmoteAnimation(canvas, ctx, width, height) {
      // Define layout areas
      const plotArea = {
        x: 50,
        y: 50,
        width: width - 250,
        height: height - 100
      };
      
      const legendArea = {
        x: plotArea.x + plotArea.width + 20,
        y: 50,
        width: 160,
        height: 180
      };
      
      // Generate dataset with clear clusters
      const { majorityPoints, minorityPoints } = generateDataset(plotArea, 'kmeans');
      
      // Find k-nearest neighbors and identify clusters
      setupNeighbors(minorityPoints);
      
      // Define clusters (typically done by k-means algorithm, here we'll use predetermined clusters)
      const clusters = [
        {
          id: 1,
          color: '#ff9800',
          points: minorityPoints.filter(p => p.x < plotArea.x + plotArea.width/2)
        },
        {
          id: 2,
          color: '#e91e63',
          points: minorityPoints.filter(p => p.x >= plotArea.x + plotArea.width/2)
        }
      ];
      
      // Animation state
      const state = {
        syntheticPoints: [],
        animPhase: 0,
        currentClusterIndex: 0,
        currentMinorityIndex: 0,
        animationFrameId: null,
        animStartTime: 0,
        currentSyntheticPoint: null,
        generationComplete: false,
        highlightedPoints: [],
        animationProgress: 0,
        cycleCount: 0,
        totalCycles: 0,
        isPaused: false
      };
      
      // Start animation
      startAnimation();
      
      function startAnimation() {
        // Reset state for a new animation
        state.animStartTime = 0;
        state.isPaused = false;
        
        // If we've reached the synthetic limit, restart from scratch
        if (state.syntheticPoints.length >= config.syntheticLimit) {
          state.syntheticPoints = [];
          state.totalCycles = 0;
          state.cycleCount = 0;
          state.currentClusterIndex = 0;
          state.currentMinorityIndex = 0;
        }
        
        state.animationFrameId = requestAnimationFrame(animate);
      }
      
      function animate(timestamp) {
        if (!state.animStartTime) state.animStartTime = timestamp;
        const elapsed = timestamp - state.animStartTime;
        
        // Clear canvas and draw layout
        drawLayout();
        
        // Phase timing calculations
        const cycleDuration = config.phaseDuration * 4; // 4 phases per cycle
        const cycleTime = elapsed % cycleDuration;
        state.animPhase = Math.floor(cycleTime / config.phaseDuration);
        state.animationProgress = (cycleTime % config.phaseDuration) / config.phaseDuration;
        
        // Draw legend
        drawLegend(legendArea.x + 10, legendArea.y + 30);
        
        // Draw title and phase description
        drawTitle("KMeans SMOTE", 20, 30);
        drawPhaseDescription(state.animPhase, legendArea.x + 10, legendArea.y + 200);
        
        // Always draw points
        drawPoints(majorityPoints, '#8884d8', 'circle'); // Majority points (blue)
        
        // Track when a full cycle completes
        if (state.animPhase === 3 && state.animationProgress > 0.9) {
          if (!state.cycleCount) {
            state.cycleCount = 1;
            state.totalCycles++;
          }
        } else {
          state.cycleCount = 0;
        }
        
        // Process based on animation phase
        switch (state.animPhase) {
          case 0: // Show original dataset with clusters
            state.highlightedPoints = [];
            
            // Draw clusters with different colors
            clusters.forEach(cluster => {
              drawPoints(cluster.points, cluster.color, 'circle');
              
              // Draw cluster boundary
              drawClusterBoundary(cluster);
            });
            
            // Draw synthetic points
            drawPoints(state.syntheticPoints, '#4caf50', 'circle');
            break;
            
          case 1: // Select a cluster and a point within it
            // If we're on a new cycle, select a new cluster and point
            if (state.animationProgress < 0.1 && !state.highlightedPoints.length) {
              // Alternate between clusters
              state.currentClusterIndex = (state.totalCycles) % clusters.length;
              const cluster = clusters[state.currentClusterIndex];
              
              // Select a point in the cluster and a neighbor
              state.currentMinorityIndex = (state.currentMinorityIndex + 1) % cluster.points.length;
              const point = cluster.points[state.currentMinorityIndex];
              
              // Find a neighbor in the same cluster
              const clusterNeighbors = point.neighbors.filter(n => 
                cluster.points.some(p => p.x === n.x && p.y === n.y)
              );
              
              if (clusterNeighbors.length > 0) {
                const neighborIndex = Math.floor(Math.random() * clusterNeighbors.length);
                
                // Highlight the points
                state.highlightedPoints = [
                  { 
                    ...point, 
                    color: '#ff9800', // orange
                    radius: 5
                  },
                  { 
                    ...clusterNeighbors[neighborIndex], 
                    color: '#9c27b0', // purple
                    radius: 5
                  }
                ];
              }
            }
            
            // Draw all clusters
            clusters.forEach(cluster => {
              drawPoints(cluster.points, cluster.color, 'circle');
              drawClusterBoundary(cluster);
            });
            
            // Draw synthetic points
            drawPoints(state.syntheticPoints, '#4caf50', 'circle');
            
            // Draw highlighted points and connection line
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            break;
            
          case 2: // Generate synthetic sample within cluster
            // Draw all clusters
            clusters.forEach(cluster => {
              drawPoints(cluster.points, cluster.color, 'circle');
              drawClusterBoundary(cluster);
            });
            
            // Draw synthetic points
            drawPoints(state.syntheticPoints, '#4caf50', 'circle');
            
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
              
              // Calculate and draw the synthetic point with animation
              if (!state.currentSyntheticPoint) {
                const alpha = Math.random(); // Random interpolation factor
                const p1 = state.highlightedPoints[0];
                const p2 = state.highlightedPoints[1];
                
                state.currentSyntheticPoint = {
                  x: p1.x + alpha * (p2.x - p1.x),
                  y: p1.y + alpha * (p2.y - p1.y),
                  radius: 4,
                  alpha: alpha,
                  startPoint: p1,
                  endPoint: p2,
                  cluster: state.currentClusterIndex + 1
                };
              }
              
              // Animate synthetic point generation
              const p1 = state.currentSyntheticPoint.startPoint;
              const p2 = state.currentSyntheticPoint.endPoint;
              const alpha = state.currentSyntheticPoint.alpha;
              const progress = Math.min(1, state.animationProgress * 2);
              
              const currentX = p1.x + progress * alpha * (p2.x - p1.x);
              const currentY = p1.y + progress * alpha * (p2.y - p1.y);
              
              // Draw synthetic point
              ctx.beginPath();
              ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
              ctx.fillStyle = '#4caf50';
              ctx.fill();
              ctx.strokeStyle = '#333';
              ctx.stroke();
              
              // Draw formula value
              const formulaBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 160,
                height: 60
              };
              
              drawFormulaBox(formulaBox, alpha, progress, state.currentClusterIndex + 1);
              
              // Add to synthetic points collection when animation completes
              if (progress === 1 && state.animationProgress > 0.9 && !state.generationComplete) {
                if (state.syntheticPoints.length < config.syntheticLimit) {
                  state.syntheticPoints.push({
                    x: currentX,
                    y: currentY,
                    radius: 3,
                    cluster: state.currentClusterIndex + 1
                  });
                }
                state.generationComplete = true;
              }
            }
            break;
            
          case 3: // Reset for next cycle
            // Draw all clusters
            clusters.forEach(cluster => {
              drawPoints(cluster.points, cluster.color, 'circle');
              drawClusterBoundary(cluster);
            });
            
            // Draw synthetic points
            drawPoints(state.syntheticPoints, '#4caf50', 'circle');
            
            if (state.highlightedPoints.length === 2) {
              drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
              drawPoints(state.highlightedPoints, null, 'star');
            }
            
            // Draw synthetic count
            const countBox = {
              x: plotArea.x + 10,
              y: plotArea.y + 10,
              width: 220,
              height: 30
            };
            
            drawCountBox(countBox);
            
            // Reset for next cycle
            if (state.animationProgress > 0.9) {
              state.currentSyntheticPoint = null;
              state.generationComplete = false;
            }
            break;
        }
        
        // Check if we need to stop and restart
        if (state.syntheticPoints.length >= config.syntheticLimit && !state.isPaused) {
          state.isPaused = true;
          // Show completed state
          drawRestartMessage();
          
          // Schedule restart after delay
          setTimeout(() => {
            startAnimation();
          }, config.autoRestartDelay);
        } else if (!state.isPaused) {
          // Continue animation
          state.animationFrameId = requestAnimationFrame(animate);
        }
      }
      
      // Drawing functions for KMeans SMOTE
      function drawLayout() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw plot area background
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        
        // Vertical grid lines
        for (let x = plotArea.x + 50; x < plotArea.x + plotArea.width; x += 50) {
          ctx.moveTo(x, plotArea.y);
          ctx.lineTo(x, plotArea.y + plotArea.height);
        }
        
        // Horizontal grid lines
        for (let y = plotArea.y + 50; y < plotArea.y + plotArea.height; y += 50) {
          ctx.moveTo(plotArea.x, y);
          ctx.lineTo(plotArea.x + plotArea.width, y);
        }
        
        ctx.stroke();
        
        // Draw legend area
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        
        // Draw algorithm area - at the bottom
        const algorithmArea = {
          x: 50,
          y: plotArea.y + plotArea.height + 10,
          width: width - 100,
          height: 30
        };
        
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        
        // Draw algorithm formula
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('KMeans SMOTE: Cluster minority samples first, then apply SMOTE within each cluster', algorithmArea.x + 10, algorithmArea.y + 20);
      }
      
      function drawTitle(title, x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, x, y);
      }
      
      function drawConnectionLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#aaa';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      function drawClusterBoundary(cluster) {
        // Simple cluster boundary - just a circle around the points
        const points = cluster.points;
        
        // Find cluster center and radius
        let sumX = 0, sumY = 0;
        points.forEach(p => {
          sumX += p.x;
          sumY += p.y;
        });
        
        const centerX = sumX / points.length;
        const centerY = sumY / points.length;
        
        // Find the farthest point to determine radius
        let maxDist = 0;
        points.forEach(p => {
          const dist = Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
          if (dist > maxDist) maxDist = dist;
        });
        
        // Draw cluster boundary
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxDist + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = cluster.color;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw cluster label
        ctx.fillStyle = cluster.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Cluster ${cluster.id}`, centerX, centerY - maxDist - 5);
        ctx.textAlign = 'left'; // Reset
      }
      
      function drawFormulaBox(box, alpha, progress, cluster) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`α = ${alpha.toFixed(2)}`, box.x + 10, box.y + 15);
        ctx.fillText(`Progress: ${(progress * 100).toFixed(0)}%`, box.x + 10, box.y + 30);
        ctx.fillText(`Cluster: ${cluster}`, box.x + 10, box.y + 45);
      }
      
      function drawCountBox(box) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Created ${state.syntheticPoints.length} of ${config.syntheticLimit} samples`, box.x + 10, box.y + 20);
      }
      
      function drawRestartMessage() {
        const msgBox = {
          x: plotArea.x + plotArea.width/4,
          y: plotArea.y + plotArea.height/2 - 20,
          width: plotArea.width/2,
          height: 40
        };
        
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restarting animation...', msgBox.x + msgBox.width/2, msgBox.y + 25);
        ctx.textAlign = 'left'; // Reset alignment
      }
      
      function drawLegend(x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Legend', x, y - 15);
        
        const items = [
          { color: '#8884d8', label: 'Majority Class' },
          { color: '#ff9800', label: 'Cluster 1' },
          { color: '#e91e63', label: 'Cluster 2' },
          { color: '#4caf50', label: 'Synthetic Samples' },
          { color: '#9c27b0', label: 'Selected Neighbor', shape: 'star' }
        ];
        
        let offsetY = 0;
        items.forEach(item => {
          ctx.beginPath();
          if (item.shape === 'star') {
            drawStar(x + 10, y + offsetY + 7, 8, 5);
          } else {
            ctx.arc(x + 10, y + offsetY + 7, 5, 0, 2 * Math.PI);
          }
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
          
          ctx.fillStyle = '#333';
          ctx.font = '14px Arial';
          ctx.fillText(item.label, x + 25, y + offsetY + 12);
          
          offsetY += 25;
        });
      }
      
      function drawPhaseDescription(phase, x, y) {
        const descriptions = [
          "Clustering minority points",
          "Selecting within clusters",
          "Creating synthetic sample",
          "Adding to collection"
        ];
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Current Step:', x, y);
        ctx.font = '14px Arial';
        ctx.fillText(descriptions[phase], x, y + 20);
      }
      
      function drawPoints(points, defaultColor, shape = 'circle') {
        points.forEach(point => {
          ctx.beginPath();
          
          const color = point.color || defaultColor;
          ctx.fillStyle = color;
          
          if (shape === 'circle') {
            ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          } else if (shape === 'star') {
            drawStar(point.x, point.y, point.radius * 2, 5);
          }
          
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.stroke();
        });
      }
      
      function drawStar(x, y, radius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? radius : radius/2;
          const currX = x + Math.cos(rot) * r;
          const currY = y + Math.sin(rot) * r;
          ctx.lineTo(currX, currY);
          rot += step;
        }
        
        ctx.closePath();
      }
      
      // Add observer to pause animation when not visible
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (!state.animationFrameId && !state.isPaused) {
            state.animStartTime = 0; // Reset animation time
            state.animationFrameId = requestAnimationFrame(animate);
          }
        } else {
          if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
          }
        }
      }, { threshold: 0.1 });
      
      observer.observe(canvas);
      
      // Cleanup on page changes
      window.addEventListener('beforeunload', () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
        }
        observer.disconnect();
      });
    }
    
    // SVM SMOTE Animation
    function svmSmoteAnimation(canvas, ctx, width, height) {
      // Define layout areas
      const plotArea = {
        x: 50,
        y: 50,
        width: width - 250,
        height: height - 100
      };
      
      const legendArea = {
        x: plotArea.x + plotArea.width + 20,
        y: 50,
        width: 200,
        height: 180
      };
      
      // Generate dataset with a clearer boundary
      const { majorityPoints, minorityPoints } = generateDataset(plotArea, 'svm');
      
      // Find k-nearest neighbors
      setupNeighbors(minorityPoints);
      
      // Identify support vectors (simplified - just use minority points near majority)
      identifySupportVectors(minorityPoints, majorityPoints);
      
      // Animation state
      const state = {
        syntheticPoints: [],
        animPhase: 0,
        currentMinorityIndex: 0,
        animationFrameId: null,
        animStartTime: 0,
        currentSyntheticPoint: null,
        generationComplete: false,
        highlightedPoints: [],
        animationProgress: 0,
        cycleCount: 0,
        totalCycles: 0,
        isPaused: false,
        supportVectors: minorityPoints.filter(p => p.isSupportVector)
      };
      
      // Start animation
      startAnimation();
      
      function startAnimation() {
        // Reset state for a new animation
        state.animStartTime = 0;
        state.isPaused = false;
        
        // If we've reached the synthetic limit, restart from scratch
        if (state.syntheticPoints.length >= config.syntheticLimit) {
          state.syntheticPoints = [];
          state.totalCycles = 0;
          state.cycleCount = 0;
          state.currentMinorityIndex = 0;
        }
        
        state.animationFrameId = requestAnimationFrame(animate);
      }
      
      function animate(timestamp) {
        if (!state.animStartTime) state.animStartTime = timestamp;
        const elapsed = timestamp - state.animStartTime;
        
        // Clear canvas and draw layout
        drawLayout();
        
        // Phase timing calculations
        const cycleDuration = config.phaseDuration * 4; // 4 phases per cycle
        const cycleTime = elapsed % cycleDuration;
        state.animPhase = Math.floor(cycleTime / config.phaseDuration);
        state.animationProgress = (cycleTime % config.phaseDuration) / config.phaseDuration;
        
        // Draw legend
        drawLegend(legendArea.x + 10, legendArea.y + 30);
        
        // Draw title and phase description
        drawTitle("SVM-SMOTE", 20, 30);
        drawPhaseDescription(state.animPhase, legendArea.x + 10, legendArea.y + 200);
        
        // Always draw points
        drawPoints(majorityPoints, '#8884d8', 'circle'); // Majority points (blue)
        
        // Regular minority points
        drawPoints(minorityPoints.filter(p => !p.isSupportVector), '#ff5252', 'circle');
        
        // Support vectors (highlighted differently)
        drawPoints(state.supportVectors, '#ff8f00', 'circle'); 
        
        // Draw synthetic points
        drawPoints(state.syntheticPoints, '#4caf50', 'circle');
        
        // Draw decision boundary approximation
        drawDecisionBoundary();
        
        // Track when a full cycle completes
        if (state.animPhase === 3 && state.animationProgress > 0.9) {
            if (!state.cycleCount) {
            state.cycleCount = 1;
            state.totalCycles++;
            }
        } else {
            state.cycleCount = 0;
        }
        
        // Process based on animation phase
        switch (state.animPhase) {
            case 0: // Show original dataset with support vectors
            state.highlightedPoints = [];
            break;
            
            case 1: // Select a support vector and a neighbor
            // If we're on a new cycle, select a new support vector
            if (state.animationProgress < 0.1 && !state.highlightedPoints.length) {
                if (state.supportVectors.length > 0) {
                state.currentMinorityIndex = (state.currentMinorityIndex + 1) % state.supportVectors.length;
                const supportVector = state.supportVectors[state.currentMinorityIndex];
                
                // Find a minority neighbor for this support vector
                const minorityNeighbors = supportVector.neighbors.filter(
                    n => minorityPoints.some(p => p.x === n.x && p.y === n.y)
                );
                
                if (minorityNeighbors.length > 0) {
                    const neighborIndex = Math.floor(Math.random() * minorityNeighbors.length);
                    
                    // Highlight the support vector and its neighbor
                    state.highlightedPoints = [
                    { 
                        ...supportVector, 
                        color: '#ff9800', // orange
                        radius: 5
                    },
                    { 
                        ...minorityNeighbors[neighborIndex], 
                        color: '#9c27b0', // purple
                        radius: 5
                    }
                ];
                }
                else {
                    // ADD THIS BLOCK: If no neighbors found, create a fallback neighbor
                    // Use the closest minority point instead
                    const closestMinority = findClosestMinorityPoint(supportVector, minorityPoints);
                    if (closestMinority) {
                      state.highlightedPoints = [
                        { 
                          ...supportVector, 
                          color: '#ff9800', // orange
                          radius: 5
                        },
                        { 
                          ...closestMinority, 
                          color: '#9c27b0', // purple
                          radius: 5
                        }
                      ];
                    }
                  }
            }   else {
                // ADD THIS BLOCK: If no support vectors identified, force progress to next cycle
                state.animPhase = (state.animPhase + 1) % 4;
              }
            }
            
            // Draw highlighted points and connection line
            if (state.highlightedPoints.length === 2) {
                drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
                drawPoints(state.highlightedPoints, null, 'star');
            }
            break;
            
            case 2: // Generate synthetic sample towards the minority class
            if (state.highlightedPoints.length === 2) {
                drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
                drawPoints(state.highlightedPoints, null, 'star');
                
                // Calculate and draw the synthetic point with animation
                if (!state.currentSyntheticPoint) {
                const alpha = Math.random() * 0.5 + 0.25; // Bias towards minority class (0.25-0.75)
                const p1 = state.highlightedPoints[0];
                const p2 = state.highlightedPoints[1];
                
                state.currentSyntheticPoint = {
                    x: p1.x + alpha * (p2.x - p1.x),
                    y: p1.y + alpha * (p2.y - p1.y),
                    radius: 4,
                    alpha: alpha,
                    startPoint: p1,
                    endPoint: p2
                };
                }
                
                // Animate synthetic point generation
                const p1 = state.currentSyntheticPoint.startPoint;
                const p2 = state.currentSyntheticPoint.endPoint;
                const alpha = state.currentSyntheticPoint.alpha;
                const progress = Math.min(1, state.animationProgress * 2);
                
                const currentX = p1.x + progress * alpha * (p2.x - p1.x);
                const currentY = p1.y + progress * alpha * (p2.y - p1.y);
                
                // Draw synthetic point
                ctx.beginPath();
                ctx.arc(currentX, currentY, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#4caf50';
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.stroke();
                
                // Draw formula value and note about SVM bias
                const formulaBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 220,
                height: 60
                };
                
                drawFormulaBox(formulaBox, alpha, progress);
                
                // Add to synthetic points collection when animation completes
                if (progress === 1 && state.animationProgress > 0.9 && !state.generationComplete) {
                if (state.syntheticPoints.length < config.syntheticLimit) {
                    state.syntheticPoints.push({
                    x: currentX,
                    y: currentY,
                    radius: 3
                    });
                }
                state.generationComplete = true;
                }
            }
            break;
            
            case 3: // Reset for next cycle
            if (state.highlightedPoints.length === 2) {
                drawConnectionLine(state.highlightedPoints[0], state.highlightedPoints[1]);
                drawPoints(state.highlightedPoints, null, 'star');
            }
            
            // Draw synthetic count
            const countBox = {
                x: plotArea.x + 10,
                y: plotArea.y + 10,
                width: 220,
                height: 30
            };
            
            drawCountBox(countBox);
            
            // Reset for next cycle
            if (state.animationProgress > 0.9) {
                state.currentSyntheticPoint = null;
                state.generationComplete = false;
            }
            break;
        }
        
        // Check if we need to stop and restart
        if (state.syntheticPoints.length >= config.syntheticLimit && !state.isPaused) {
            state.isPaused = true;
            // Show completed state
            drawRestartMessage();
            
            // Schedule restart after delay
            setTimeout(() => {
            startAnimation();
            }, config.autoRestartDelay);
        } else if (!state.isPaused) {
            // Continue animation
            state.animationFrameId = requestAnimationFrame(animate);
        }
        }
        
        // Drawing functions for SVM SMOTE
        function drawLayout() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw plot area background
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(plotArea.x, plotArea.y, plotArea.width, plotArea.height);
        
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = '#e8e8e8';
        
        // Vertical grid lines
        for (let x = plotArea.x + 50; x < plotArea.x + plotArea.width; x += 50) {
            ctx.moveTo(x, plotArea.y);
            ctx.lineTo(x, plotArea.y + plotArea.height);
        }
        
        // Horizontal grid lines
        for (let y = plotArea.y + 50; y < plotArea.y + plotArea.height; y += 50) {
            ctx.moveTo(plotArea.x, y);
            ctx.lineTo(plotArea.x + plotArea.width, y);
        }
        
        ctx.stroke();
        
        // Draw legend area
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(legendArea.x, legendArea.y, legendArea.width, legendArea.height);
        
        // Draw algorithm area - at the bottom
        const algorithmArea = {
            x: 50,
            y: plotArea.y + plotArea.height + 10,
            width: width - 100,
            height: 30
        };
        
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(algorithmArea.x, algorithmArea.y, algorithmArea.width, algorithmArea.height);
        
        // Draw algorithm formula
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('SVM-SMOTE: Generate samples near support vectors, biased away from decision boundary', algorithmArea.x + 10, algorithmArea.y + 20);
        }
        
        function drawTitle(title, x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, x, y);
        }
        
        function drawConnectionLine(p1, p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#aaa';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        }
        
        function drawDecisionBoundary() {
        // Simplified decision boundary visualization - just a line separating the classes
        // In reality, SVM would compute a more complex boundary
        
        // Find average positions of majority and minority clusters
        let majorityX = 0, majorityY = 0;
        majorityPoints.forEach(p => {
            majorityX += p.x;
            majorityY += p.y;
        });
        majorityX /= majorityPoints.length;
        majorityY /= majorityPoints.length;
        
        let minorityX = 0, minorityY = 0;
        minorityPoints.forEach(p => {
            minorityX += p.x;
            minorityY += p.y;
        });
        minorityX /= minorityPoints.length;
        minorityY /= minorityPoints.length;
        
        // Draw a perpendicular line between the two centroids
        const dx = minorityX - majorityX;
        const dy = minorityY - majorityY;
        
        // Midpoint between centroids
        const midX = (majorityX + minorityX) / 2;
        const midY = (majorityY + minorityY) / 2;
        
        // Perpendicular direction
        const perpX = -dy;
        const perpY = dx;
        
        // Normalize to get unit vector
        const length = Math.sqrt(perpX * perpX + perpY * perpY);
        const unitPerpX = perpX / length;
        const unitPerpY = perpY / length;
        
        // Scale to plot size
        const lineLength = Math.max(plotArea.width, plotArea.height);
        
        // Start and end points for the decision boundary line
        const startX = midX - unitPerpX * lineLength/2;
        const startY = midY - unitPerpY * lineLength/2;
        const endX = midX + unitPerpX * lineLength/2;
        const endY = midY + unitPerpY * lineLength/2;
        
        // Draw the decision boundary
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1; // Reset
        
        // Label the decision boundary
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Decision Boundary', midX, midY - 10);
        ctx.textAlign = 'left'; // Reset
        }
        
        function drawFormulaBox(box, alpha, progress) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`α = ${alpha.toFixed(2)} (biased away from boundary)`, box.x + 10, box.y + 15);
        ctx.fillText(`Progress: ${(progress * 100).toFixed(0)}%`, box.x + 10, box.y + 30);
        ctx.fillText(`Using support vector points only`, box.x + 10, box.y + 45);
        }
        
        function drawCountBox(box) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(`Created ${state.syntheticPoints.length} of ${config.syntheticLimit} samples`, box.x + 10, box.y + 20);
        }
        
        function drawRestartMessage() {
        const msgBox = {
            x: plotArea.x + plotArea.width/4,
            y: plotArea.y + plotArea.height/2 - 20,
            width: plotArea.width/2,
            height: 40
        };
        
        ctx.fillStyle = 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(msgBox.x, msgBox.y, msgBox.width, msgBox.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Restarting animation...', msgBox.x + msgBox.width/2, msgBox.y + 25);
        ctx.textAlign = 'left'; // Reset alignment
        }
        
        function drawLegend(x, y) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Legend', x, y - 15);
        
        const items = [
            { color: '#8884d8', label: 'Majority Class' },
            { color: '#ff5252', label: 'Minority Class' },
            { color: '#ff8f00', label: 'Support Vectors' },
            { color: '#4caf50', label: 'Synthetic Samples' },
            { color: '#9c27b0', label: 'Selected Neighbor', shape: 'star' }
        ];
        
        let offsetY = 0;
        items.forEach(item => {
            ctx.beginPath();
            if (item.shape === 'star') {
            drawStar(x + 10, y + offsetY + 7, 8, 5);
            } else {
            ctx.arc(x + 10, y + offsetY + 7, 5, 0, 2 * Math.PI);
            }
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
            
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.fillText(item.label, x + 25, y + offsetY + 12);
            
            offsetY += 25;
        });
        }
        
        function drawPhaseDescription(phase, x, y) {
        const descriptions = [
            "Identifying support vectors",
            "Selecting SV point",
            "Creating synthetic sample",
            "Adding to collection"
        ];
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Current Step:', x, y);
        ctx.font = '14px Arial';
        ctx.fillText(descriptions[phase], x, y + 20);
        }
        
        function drawPoints(points, defaultColor, shape = 'circle') {
        points.forEach(point => {
            ctx.beginPath();
            
            const color = point.color || defaultColor;
            ctx.fillStyle = color;
            
            if (shape === 'circle') {
            ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
            } else if (shape === 'star') {
            drawStar(point.x, point.y, point.radius * 2, 5);
            }
            
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
        });
        }
        
        function drawStar(x, y, radius, points) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / points;
        
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? radius : radius/2;
            const currX = x + Math.cos(rot) * r;
            const currY = y + Math.sin(rot) * r;
            ctx.lineTo(currX, currY);
            rot += step;
        }
        
        ctx.closePath();
        }
        
        // Add observer to pause animation when not visible
        const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            if (!state.animationFrameId && !state.isPaused) {
            state.animStartTime = 0; // Reset animation time
            state.animationFrameId = requestAnimationFrame(animate);
            }
        } else {
            if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
            }
        }
        }, { threshold: 0.1 });
        
        observer.observe(canvas);
        
        // Cleanup on page changes
        window.addEventListener('beforeunload', () => {
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
        }
        observer.disconnect();
        });
    }
    
    // Helper functions used by all animations
    
    // Generate dataset with different distributions based on type
    function generateDataset(plotArea, type) {
        const majorityPoints = [];
        const minorityPoints = [];
        
        switch (type) {
        case 'standard':
            // Majority class (larger number of points in a broad area)
            for (let i = 0; i < config.majorityPoints; i++) {
            majorityPoints.push({
                x: plotArea.x + Math.random() * plotArea.width,
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3
            });
            }
            
            // Minority class (smaller number of points in a cluster)
            for (let i = 0; i < config.minorityPoints; i++) {
            minorityPoints.push({
                x: plotArea.x + plotArea.width * 0.3 + Math.random() * (plotArea.width * 0.4),
                y: plotArea.y + plotArea.height * 0.3 + Math.random() * (plotArea.height * 0.4),
                radius: 3,
                neighbors: []
            });
            }
            break;
            
        case 'borderline':
            // Majority class (larger number of points with some close to minority)
            for (let i = 0; i < config.majorityPoints; i++) {
            majorityPoints.push({
                x: plotArea.x + Math.random() * plotArea.width,
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3
            });
            }
            
            // Add some majority points close to where minority will be
            for (let i = 0; i < 5; i++) {
            majorityPoints.push({
                x: plotArea.x + plotArea.width * 0.35 + Math.random() * (plotArea.width * 0.3),
                y: plotArea.y + plotArea.height * 0.35 + Math.random() * (plotArea.height * 0.3),
                radius: 3
            });
            }
            
            // Minority class (smaller number of points in a tighter cluster)
            for (let i = 0; i < config.minorityPoints; i++) {
            minorityPoints.push({
                x: plotArea.x + plotArea.width * 0.35 + Math.random() * (plotArea.width * 0.3),
                y: plotArea.y + plotArea.height * 0.35 + Math.random() * (plotArea.height * 0.3),
                radius: 3,
                neighbors: [],
                isBorderline: false // Will be set later
            });
            }
            break;
            
        case 'adasyn':
            // Majority class with varying density around minority
            for (let i = 0; i < config.majorityPoints; i++) {
            majorityPoints.push({
                x: plotArea.x + Math.random() * plotArea.width,
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3
            });
            }
            
            // Add more majority points on one side to create varying difficulty
            for (let i = 0; i < 10; i++) {
            majorityPoints.push({
                x: plotArea.x + plotArea.width * 0.6 + Math.random() * (plotArea.width * 0.3),
                y: plotArea.y + plotArea.height * 0.2 + Math.random() * (plotArea.height * 0.6),
                radius: 3
            });
            }
            
            // Minority class with some points closer to majority concentrations
            for (let i = 0; i < config.minorityPoints; i++) {
            // First half in easier region, second half in harder region
            const x = i < config.minorityPoints/2 
                ? plotArea.x + plotArea.width * 0.2 + Math.random() * (plotArea.width * 0.2)
                : plotArea.x + plotArea.width * 0.5 + Math.random() * (plotArea.width * 0.2);
                
            minorityPoints.push({
                x: x,
                y: plotArea.y + plotArea.height * 0.3 + Math.random() * (plotArea.height * 0.4),
                radius: 3,
                neighbors: [],
                difficulty: 0 // Will be calculated later
            });
            }
            break;
            
        case 'kmeans':
            // Majority class
            for (let i = 0; i < config.majorityPoints; i++) {
            majorityPoints.push({
                x: plotArea.x + Math.random() * plotArea.width,
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3
            });
            }
            
            // Minority class in two distinct clusters
            // Cluster 1
            for (let i = 0; i < config.minorityPoints/2; i++) {
            minorityPoints.push({
                x: plotArea.x + plotArea.width * 0.2 + Math.random() * (plotArea.width * 0.15),
                y: plotArea.y + plotArea.height * 0.2 + Math.random() * (plotArea.height * 0.15),
                radius: 3,
                neighbors: []
            });
            }
            
            // Cluster 2
            for (let i = 0; i < config.minorityPoints/2; i++) {
            minorityPoints.push({
                x: plotArea.x + plotArea.width * 0.7 + Math.random() * (plotArea.width * 0.15),
                y: plotArea.y + plotArea.height * 0.7 + Math.random() * (plotArea.height * 0.15),
                radius: 3,
                neighbors: []
            });
            }
            break;
            
        case 'svm':
            // Create a clearer separation between classes for SVM demo
            
            // Majority class to one side
            for (let i = 0; i < config.majorityPoints; i++) {
            majorityPoints.push({
                x: plotArea.x + plotArea.width * 0.5 + Math.random() * (plotArea.width * 0.45),
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3
            });
            }
            
            // Minority class to the other side
            for (let i = 0; i < config.minorityPoints; i++) {
            minorityPoints.push({
                x: plotArea.x + Math.random() * (plotArea.width * 0.45),
                y: plotArea.y + Math.random() * plotArea.height,
                radius: 3,
                neighbors: [],
                isSupportVector: false // Will be set later
            });
            }
            break;
            
        default:
            // Fallback to standard distribution
            return generateDataset(plotArea, 'standard');
        }
        
        return { majorityPoints, minorityPoints };
    }
    
    // Find k-nearest neighbors for each minority point
    function setupNeighbors(minorityPoints) {
        const k = 3; // Number of neighbors to find (simplified for demo)
        
        minorityPoints.forEach(point => {
        const distances = minorityPoints
            .filter(p => p !== point)
            .map(p => ({
            point: p,
            distance: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
            }))
            .sort((a, b) => a.distance - b.distance);
        
        point.neighbors = distances.slice(0, k).map(d => d.point);
        });
    }
    
    // Identify borderline points for Borderline-SMOTE
    function identifyBorderlinePoints(minorityPoints, majorityPoints) {
        const k = 5; // Number of neighbors to check
        
        minorityPoints.forEach(point => {
        // Get k nearest majority points
        const majorityNeighbors = majorityPoints
            .map(p => ({
            point: p,
            distance: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, k)
            .map(d => d.point);
        
        // Store majority neighbors for visualization
        point.majorityNeighbors = majorityNeighbors;
        
        // Calculate ratio of majority neighbors to determine if it's a borderline point
        const totalNeighbors = k;
        const majorityRatio = majorityNeighbors.length / totalNeighbors;
        
        // If more than half but not all neighbors are from majority class, it's borderline
        point.isBorderline = majorityRatio > 0.5 && majorityRatio < 1.0;
        });
    }
    
    // Calculate difficulty weights for ADASYN
    function calculateDifficultyWeights(minorityPoints, majorityPoints) {
        const k = 5; // Number of neighbors to check
        
        // For each minority point, calculate ratio of majority neighbors
        minorityPoints.forEach(point => {
        // Find k nearest neighbors from all points
        const neighbors = [...minorityPoints, ...majorityPoints]
            .filter(p => p !== point)
            .map(p => ({
            point: p,
            distance: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, k);
        
        // Count majority class neighbors
        const majorityNeighbors = neighbors.filter(n => 
            majorityPoints.some(p => p.x === n.point.x && p.y === n.point.y)
        );
        
        // Calculate difficulty (ratio of majority neighbors)
        point.difficulty = majorityNeighbors.length / k;
        });
        
        // Normalize difficulties to sum to 1 (for weighted selection)
        const totalDifficulty = minorityPoints.reduce((sum, p) => sum + p.difficulty, 0);
        if (totalDifficulty > 0) {
        minorityPoints.forEach(p => {
            p.difficulty = p.difficulty / totalDifficulty;
        });
        }
    }
    
    // Select a minority point based on difficulty weights (for ADASYN)
    function selectWeightedMinorityPoint(minorityPoints) {
        // Generate a random value [0, 1)
        const r = Math.random();
        
        // Use difficulty weights to select a point
        let cumulativeWeight = 0;
        
        for (let i = 0; i < minorityPoints.length; i++) {
        cumulativeWeight += minorityPoints[i].difficulty;
        if (r < cumulativeWeight) {
            return i;
        }
        }
        
        // Fallback to random selection
        return Math.floor(Math.random() * minorityPoints.length);
    }
    
    // Identify support vectors for SVM-SMOTE
    function identifySupportVectors(minorityPoints, majorityPoints) {
        // In a real SVM, support vectors would be identified by the algorithm
        // Here we'll simplify by assuming minority points closest to majority class are support vectors
        
        const k = 3; // Number of majority neighbors to check
        
        minorityPoints.forEach(point => {
        // Get distances to all majority points
        const distances = majorityPoints
            .map(p => ({
            point: p,
            distance: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
            }))
            .sort((a, b) => a.distance - b.distance);
        
        // Use the k closest majority points
        const closestDistance = distances[0].distance;
        
        // Points with majority neighbors closer than a threshold are support vectors
        // Threshold is relative to the closest support vector to avoid hardcoding
        point.isSupportVector = closestDistance < 120; // Tuned for visualization
        });
    }
});
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, TextField, Grid, Button } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const backendUrl = 'https://dashboard-api-git-main-yossaphan-kaenwongs-projects.vercel.app';


const Dashboard = () => {
  const [returnData, setReturnData] = useState([]);
  const [returnAvgData, setReturnAvgData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'StudentID', direction: 'ascending' });
  const [topRecords, setTopRecords] = useState(10);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      const response = await fetch(`${backendUrl}/dashboard`, {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const newData = await response.json();

      // Log the fetched data for debugging
      console.log('Fetched Data:', newData);

      // Check if the data has the expected structure
      if (newData && Array.isArray(newData.recordset)) {
        setReturnData(newData.recordset);
      } else {
        console.error('Unexpected data format:', newData);
        setError('Unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };
  const fetchAvgScore = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before fetching
      const response = await fetch(`${backendUrl}/avgscore`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const newAvgScore = await response.json();
      console.log('Fetched Avg Score:', newAvgScore);

      // Check if the data has the expected structure
      if (newAvgScore && Array.isArray(newAvgScore.recordset)) {
        setReturnAvgData(newAvgScore.recordset);
      } else {
        console.error('Unexpected data format:', newAvgScore);
        setError('Unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAvgScore();
  }, []);

  // Handle filter input change
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Handle top records input change
  const handleTopRecordsChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setTopRecords(isNaN(value) ? 10 : value);
  };

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply filtering and sorting
  const filteredData = returnData.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.slice(0, topRecords);
  }, [filteredData, sortConfig, topRecords]);

  // Chart Data Configuration
  const chartDataDVRT = {
    labels: sortedData.map(item => `ID: ${item.studentID}`),
    datasets: [{
      label: 'DVRT Score',
      data: sortedData.map(item => item.DVRTID),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const chartDataPrestige = {
    labels: sortedData.map(item => `ID: ${item.studentID}`),
    datasets: [{
      label: 'Fathers Prestige Score',
      data: sortedData.map(item => item.FathersPrestigeScore),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }],
  };


  return (
    <div>
      <Typography variant="h4" align="center" style={{ marginBottom: '20px' }}>Dashboard</Typography>
      <Grid item xs={12}>
        <Button variant="contained" onClick={() => (window.location.href = '/datainsert')}>Go to Insert Student</Button>
        <Button variant="outlined" style={{ marginLeft: '10px' }} onClick={() => (window.location.href = '/')}>Back to Login</Button>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Bar data={chartDataDVRT} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Bar data={chartDataPrestige} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField label="Filter" variant="outlined" fullWidth value={filter} onChange={handleFilterChange} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField label="Top Records" type="number" variant="outlined" fullWidth value={topRecords} onChange={handleTopRecordsChange} />
        </Grid>

        {loading ? (
          <CircularProgress style={{ margin: '20px auto' }} />
        ) : error ? (
          <Typography color="error" variant="body1">{error}</Typography>
        ) : (
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {Object.keys(sortedData[0] || {}).map((key, index) => (
                        <TableCell key={index} onClick={() => requestSort(key)} style={{ cursor: 'pointer' }}>
                          <strong>{key}</strong>
                          {sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedData.map((item, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(item).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
          </Grid>
          <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Average Scores</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returnAvgData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{JSON.stringify(item)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </div>
  );
};

export default Dashboard;

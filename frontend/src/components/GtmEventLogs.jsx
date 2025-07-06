import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { getApiBaseUrl } from '../services/api';

const GtmEventLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [containerFilter, setContainerFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (levelFilter) params.append('level', levelFilter);
      if (eventFilter) params.append('event', eventFilter);
      if (containerFilter) params.append('container', containerFilter);
      
      const response = await fetch(`${getApiBaseUrl()}/logs/gtm-events?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (err) {
      setError('Error fetching logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/logs/gtm-events/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gtm_events_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Error downloading logs: ' + err.message);
    }
  };

  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiBaseUrl()}/logs/gtm-events/clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setLogs([]);
        } else {
          setError('Failed to clear logs');
        }
      } catch (err) {
        setError('Error clearing logs: ' + err.message);
      }
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, eventFilter, containerFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETE':
        return 'success';
      case 'ERROR':
      case 'TOKEN_ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'RECEIVED':
      case 'SENT':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'COMPLETE':
        return <CheckCircleIcon color="success" />;
      case 'ERROR':
      case 'TOKEN_ERROR':
        return <ErrorIcon color="error" />;
      case 'WARNING':
        return <WarningIcon color="warning" />;
      case 'RECEIVED':
      case 'SENT':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString('tr-TR');
    } catch {
      return timestamp;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            GTM Event Logları
          </Typography>
          <Box>
            <Tooltip title="Refresh Logs">
              <IconButton onClick={fetchLogs} disabled={loading} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Logs">
              <IconButton onClick={downloadLogs} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Logs">
              <IconButton onClick={clearLogs} color="error">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              label="Level"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Event</InputLabel>
            <Select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              label="Event"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="AddPaymentInfo">AddPaymentInfo</MenuItem>
              <MenuItem value="Lead">Lead</MenuItem>
              <MenuItem value="Purchase">Purchase</MenuItem>
              <MenuItem value="ViewContent">ViewContent</MenuItem>
              <MenuItem value="AddToCart">AddToCart</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            size="small"
            label="Container ID"
            value={containerFilter}
            onChange={(e) => setContainerFilter(e.target.value)}
            placeholder="GTM-XXXXXXX"
            sx={{ minWidth: 150 }}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Logs Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Container</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(log.status)}
                        <Chip
                          label={log.status || log.level}
                          color={getStatusColor(log.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {formatTimestamp(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {log.event || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {log.container || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {log.pixel_id && (
                          <Typography variant="caption" display="block">
                            Pixel: {log.pixel_id}
                          </Typography>
                        )}
                        {log.duration && (
                          <Typography variant="caption" display="block">
                            Duration: {log.duration}ms
                          </Typography>
                        )}
                        {log.error && (
                          <Typography variant="caption" display="block" color="error">
                            Error: {log.error}
                          </Typography>
                        )}
                        {log.final_status && (
                          <Typography variant="caption" display="block">
                            Final Status: {log.final_status}
                          </Typography>
                        )}
                        {log.raw_message && log.raw_message.length > 50 && (
                          <Tooltip title={log.raw_message}>
                            <Typography variant="caption" display="block" sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {log.raw_message.substring(0, 50)}...
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        {logs.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Total: {logs.length} log entries
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Last updated: {new Date().toLocaleString('tr-TR')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GtmEventLogs; 
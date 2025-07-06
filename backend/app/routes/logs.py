from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import json
from datetime import datetime, timedelta
import re

logs_bp = Blueprint('logs', __name__)

def parse_gtm_log_line(line):
    """Parse a single line from the GTM events log file"""
    try:
        # Extract timestamp and message from log line
        parts = line.strip().split(' - ', 2)
        if len(parts) >= 3:
            timestamp_str = parts[0]
            level = parts[1]
            message = parts[2]
            
            # Parse the message to extract structured data
            log_entry = {
                'timestamp': timestamp_str,
                'level': level,
                'raw_message': message
            }
            
            # Try to extract structured data from the message
            if 'GTM Event Received:' in message:
                # Extract event name
                event_match = re.search(r'GTM Event Received: (\w+)', message)
                if event_match:
                    log_entry['event'] = event_match.group(1)
                    log_entry['status'] = 'RECEIVED'
                
                # Extract container ID
                container_match = re.search(r'Container: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                
                # Try to extract JSON data using regex
                try:
                    data_match = re.search(r'Data: (\{.*\})', message, re.DOTALL)
                    if data_match:
                        data_json = data_match.group(1)
                        data_obj = json.loads(data_json)
                        log_entry['data'] = data_obj
                except Exception as json_error:
                    # If JSON parsing fails, just store the raw data string
                    data_match = re.search(r'Data: (\{.*\})', message, re.DOTALL)
                    if data_match:
                        log_entry['data_raw'] = data_match.group(1)
                    
            elif 'Meta Request Sent:' in message:
                # Extract event name
                event_match = re.search(r'Meta Request Sent: (\w+)', message)
                if event_match:
                    log_entry['event'] = event_match.group(1)
                    log_entry['status'] = 'SENT'
                
                # Extract container ID
                container_match = re.search(r'Container: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                
                # Extract pixel ID
                pixel_match = re.search(r'Pixel: (\d+)', message)
                if pixel_match:
                    log_entry['pixel_id'] = pixel_match.group(1)
                    
            elif 'Meta Response Success:' in message:
                # Extract event name
                event_match = re.search(r'Meta Response Success: (\w+)', message)
                if event_match:
                    log_entry['event'] = event_match.group(1)
                    log_entry['status'] = 'SUCCESS'
                
                # Extract container ID
                container_match = re.search(r'Container: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                
                # Try to extract JSON response using regex
                try:
                    response_match = re.search(r'Response: (\{.*\})', message, re.DOTALL)
                    if response_match:
                        response_json = response_match.group(1)
                        response_obj = json.loads(response_json)
                        log_entry['response'] = response_obj
                except Exception as json_error:
                    # If JSON parsing fails, just store the raw response string
                    response_match = re.search(r'Response: (\{.*\})', message, re.DOTALL)
                    if response_match:
                        log_entry['response_raw'] = response_match.group(1)
                    
            elif 'Meta Response Error:' in message:
                # Extract event name
                event_match = re.search(r'Meta Response Error: (\w+)', message)
                if event_match:
                    log_entry['event'] = event_match.group(1)
                    log_entry['status'] = 'ERROR'
                
                # Extract container ID
                container_match = re.search(r'Container: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                
                # Extract error message
                error_match = re.search(r'Error: (.+)$', message)
                if error_match:
                    log_entry['error'] = error_match.group(1)
                    
            elif 'GTM Event Complete:' in message:
                # Extract event name
                event_match = re.search(r'GTM Event Complete: (\w+)', message)
                if event_match:
                    log_entry['event'] = event_match.group(1)
                    log_entry['status'] = 'COMPLETE'
                
                # Extract container ID
                container_match = re.search(r'Container: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                
                # Extract status and duration
                status_match = re.search(r'Status: (\w+)', message)
                if status_match:
                    log_entry['final_status'] = status_match.group(1)
                
                duration_match = re.search(r'Duration: (\d+)ms', message)
                if duration_match:
                    log_entry['duration'] = int(duration_match.group(1))
                    
            elif 'Token Info Request Failed:' in message:
                # Extract container ID
                container_match = re.search(r'Token Info Request Failed: (GTM-[A-Z0-9]+)', message)
                if container_match:
                    log_entry['container'] = container_match.group(1)
                    log_entry['status'] = 'TOKEN_ERROR'
                
                # Extract error message
                error_match = re.search(r'Error: (.+)$', message)
                if error_match:
                    log_entry['error'] = error_match.group(1)
            
            return log_entry
    except Exception as e:
        return {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'level': 'ERROR',
            'raw_message': f'Error parsing log line: {str(e)}',
            'status': 'PARSE_ERROR'
        }
    
    return None

@logs_bp.route('/gtm-events', methods=['GET'])
@jwt_required()
def get_gtm_events():
    """Get GTM event logs"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 100, type=int)
        level_filter = request.args.get('level', '')
        event_filter = request.args.get('event', '')
        container_filter = request.args.get('container', '')
        
        # Log file path
        log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs', 'gtm_events.log')
        
        if not os.path.exists(log_file_path):
            return jsonify({'logs': [], 'total': 0, 'message': 'No log file found'}), 200
        
        # Read and parse logs
        logs = []
        with open(log_file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Parse each line
        for line in lines:
            if line.strip():
                log_entry = parse_gtm_log_line(line)
                if log_entry:
                    # Apply filters
                    if level_filter and log_entry.get('level', '').upper() != level_filter.upper():
                        continue
                    if event_filter and log_entry.get('event', '').upper() != event_filter.upper():
                        continue
                    if container_filter and log_entry.get('container', '').upper() != container_filter.upper():
                        continue
                    
                    logs.append(log_entry)
        
        # Sort by timestamp (newest first)
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Apply limit
        logs = logs[:limit]
        
        return jsonify({
            'logs': logs,
            'total': len(logs),
            'message': f'Retrieved {len(logs)} log entries'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/gtm-events/download', methods=['GET'])
@jwt_required()
def download_gtm_events():
    """Download GTM event logs as file"""
    try:
        log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs', 'gtm_events.log')
        
        if not os.path.exists(log_file_path):
            return jsonify({'error': 'Log file not found'}), 404
        
        return send_file(
            log_file_path,
            as_attachment=True,
            download_name=f'gtm_events_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
            mimetype='text/plain'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/gtm-events/clear', methods=['POST'])
@jwt_required()
def clear_gtm_events():
    """Clear GTM event logs"""
    try:
        log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs', 'gtm_events.log')
        
        # Create empty file or clear existing
        with open(log_file_path, 'w') as f:
            f.write('')
        
        return jsonify({'message': 'Logs cleared successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@logs_bp.route('/gtm-events/stats', methods=['GET'])
@jwt_required()
def get_gtm_events_stats():
    """Get statistics about GTM events"""
    try:
        logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
        log_file_path = os.path.join(logs_dir, 'gtm_events.log')
        
        if not os.path.exists(log_file_path):
            return jsonify({
                'total_events': 0,
                'success_count': 0,
                'error_count': 0,
                'warning_count': 0,
                'info_count': 0,
                'events_by_type': {},
                'recent_activity': []
            }), 200
        
        # Read and analyze logs
        total_events = 0
        success_count = 0
        error_count = 0
        warning_count = 0
        info_count = 0
        events_by_type = {}
        recent_activity = []
        
        with open(log_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    total_events += 1
                    log_entry = parse_gtm_log_line(line)
                    
                    if log_entry:
                        level = log_entry.get('level', 'INFO')
                        if level == 'SUCCESS':
                            success_count += 1
                        elif level == 'ERROR':
                            error_count += 1
                        elif level == 'WARNING':
                            warning_count += 1
                        else:
                            info_count += 1
                        
                        # Count events by type
                        event_name = log_entry.get('event')
                        if event_name:
                            events_by_type[event_name] = events_by_type.get(event_name, 0) + 1
                        
                        # Add to recent activity (last 10 events)
                        if len(recent_activity) < 10:
                            recent_activity.append({
                                'timestamp': log_entry.get('timestamp'),
                                'event_name': event_name,
                                'level': level,
                                'message': log_entry.get('raw_message', '')[:100] + '...' if len(log_entry.get('raw_message', '')) > 100 else log_entry.get('raw_message', '')
                            })
        
        return jsonify({
            'total_events': total_events,
            'success_count': success_count,
            'error_count': error_count,
            'warning_count': warning_count,
            'info_count': info_count,
            'events_by_type': events_by_type,
            'recent_activity': recent_activity
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 
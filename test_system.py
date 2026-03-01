"""
Test script for the integrated system
"""

from integrated_system import run_integrated_system

# Test with sample input
test_input = "I have a cough and fever"

print("Testing with input:", test_input)
print()

result = run_integrated_system(test_input)

if result:
    print("\n✓ Test completed successfully!")
else:
    print("\n✗ Test failed")

class MyAudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0 && output.length > 0) {
      for (let channel = 0; channel < input.length; ++channel) {
        output[channel].set(input[channel]);
      }
      this.port.postMessage(input[0]);
    }
    return true;
  }
}

registerProcessor("my-audio-processor", MyAudioProcessor);
